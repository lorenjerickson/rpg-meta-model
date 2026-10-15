# Combat rounds

Status: design. Step costs are implemented; the round engine is not yet.

Combat has no initiative order and no turns. At the start of each round, every combatant secretly
plans what they will do over the next 6 seconds, and the system then plays all the plans out
together, one second at a time. Attack, defense, damage and soak work as described in the README;
this document covers how a round is structured.

## Terms

- **Round:** 6 seconds of combat, numbered second 1 to second 6. Rules text refers to rounds,
  not turns (see [Rules text](#rules-text)).
- **Plan:** a combatant's private, ordered list of steps for the round.
- **Step:** one thing a combatant does: a movement, an action, a bonus action or a declared
  reaction. Every step has a cost in whole seconds.
- **Changeset:** a set of changes to game state for one second: positions, steps starting and
  finishing, reactions triggered, hits, damage and conditions.

## The round at a glance

1. **Planning:** every combatant submits a plan, and initiative is rolled for the round.
2. **For each second, 1 to 6:**
   1. **Evaluation** produces a _proposed_ changeset.
   2. **Reconciliation** turns it into a _committable_ changeset.
   3. **Resolution** writes the committed changeset to game state.
3. **End of round:** unused reactions expire, and the next round's planning begins.

## Planning

### Who plans

Every combatant plans: players for their characters, and the GM for every creature they control.
Plans are private. Nobody, allies included, sees another plan until the round is evaluated.

A surprised combatant submits no plan for the first round. A combatant who submits no plan, or
whose plan ends before second 6, is idle for the rest of the round.

### Budget

A plan may contain:

- **Movement:** any number of movement steps, split around other steps as you like, totalling no
  more than your Speed (twice your Speed when running).
- **One action.**
- **One bonus action.**
- **One declared reaction.**

The steps run one at a time, in the order planned, and together must fit in 6 seconds.

### Steps and their costs

Every step has a cost in seconds, and takes effect at the end of its last second. Any action,
bonus action or reaction takes **1 second** unless it says otherwise; only things that clearly
take longer have a cost of their own, and a slower version of an activity always buys something.

| Step                                           | Seconds       | Notes                                     |
| ---------------------------------------------- | ------------- | ----------------------------------------- |
| Melee attack                                   | 1             |                                           |
| Heavy melee weapon (fire axe, maul)            | 2             |                                           |
| Snap shot                                      | 1             | Subtract 1d4 from attack                  |
| Shot                                           | 2             |                                           |
| Aimed shot                                     | 3             | Add 1d6 to attack                         |
| Opportunity attack                             | 1             |                                           |
| Reload                                         | Set by weapon | Revolver 3, bolt-action rifle 2, musket 6 |
| Clear a jam                                    | 2             |                                           |
| Apparatus or preparation effect (action)       | 2             |                                           |
| Apparatus or preparation effect (bonus action) | 1             |                                           |
| Dodge, Defend, Help, Hide, Compose Yourself    | 1             |                                           |
| Search, Study, Influence                       | 2             |                                           |
| Death save                                     | 1             |                                           |

Actions and apparatus effects record any cost other than the default in a `seconds` field, and firearms record `reloadSeconds`. The helpers in [`src/combat/timing.ts`](../src/combat/timing.ts) work out the cost of attacks, reloading, effects and movement.

**Several attacks in one action** (Multiattack, or a profession's extra attacks) are sub-steps run
one after another within the action, each with its own cost and its own target, and with no
movement between them. A ghoul's bite and two claws take 3 seconds. If an attack's target dies
before that attack begins, the attack is cancelled and the rest of the plan moves up.

A step's target is a creature, a thing or a location. Plans contain no conditions ("if the ghoul
reaches the doctor, shoot it"); declared reactions are the only steps that wait for something to
happen.

### Movement

Speed is measured as in D&D: the number of feet a creature can move in a round. A movement step's
cost is the share of the round its distance takes, rounded up to a whole second:

```
seconds = ceil(6 × distance ÷ Speed)
```

At Speed 30, moving 15 feet takes 3 seconds. At Speed 20 it takes 5 seconds (4.5, rounded up),
and at Speed 60 it takes 2.

Positions are tracked on a 5-foot grid. During a movement step, the creature enters each square
at the point in the step where its distance so far reaches that square. Reach, range, blocking
and opportunity attacks are checked against these squares, second by second.

**Running** works like Dash: it uses the action, and doubles the creature's Speed for the round.

**Pursuit:** a movement step can target a creature instead of a location. The path is planned
again each second towards the creature's current square, and the step ends as soon as the
creature is within reach. Because its length isn't known in advance, a pursuit is planned for a
number of seconds ("pursue the ghoul for up to 4 seconds"); if it ends early, the rest of the plan
moves up. A movement step that targets a location heads for that location.

### Declared reactions

A reaction can only be taken if it is declared in the plan, with its trigger and target. There
are three kinds:

- **Ready:** spend your action to declare a reaction that is itself an action (an attack, Operate
  or Utilize), with a trigger from the list below.
- **Defend:** a Ready with a fixed trigger (a creature attacks the guarded target) and, for melee,
  reach measured from the guarded target.
- **Any other declared reaction** must be something that already costs a reaction, such as a
  profession's reaction.

Triggers are limited to events the system can check:

- a creature enters a location, or comes within your reach or range;
- a creature leaves a location;
- a creature attacks or targets a given creature.

Timing:

- A declared reaction is active from its position in the plan until the end of the round.
- It starts in the second after its trigger, and takes its cost in seconds from the rest of the
  plan (see [Reconciliation](#reconciliation)).
- **Actions can't be interrupted.** A reaction triggered while you are partway through an action
  waits until the action finishes. A reaction triggered while you are moving pauses the movement,
  which resumes after the reaction. Long actions are a real choice: while you aim, your guard is
  down.
- It must finish by the end of second 6. A reaction lasting _d_ seconds can only start up to
  second 7 − _d_; a later trigger is ignored. For example, a 2-second rifle counter-attack must
  start by second 5, so its trigger must come by second 4.

**Opportunity attacks** work as in D&D: they are reactions, triggered when a creature leaves your
reach, and follow the same timing rules as declared reactions. A combatant who has declared a
reaction in their plan can't make opportunity attacks that round.

### Pre-rolled attacks

Attack rolls and damage are rolled when an attack step is declared, and kept hidden until the
attack takes effect. They are compared against the target's state at that moment: its defense,
cover and conditions, which may have changed during the round. Declared reactions are pre-rolled
the same way. Opportunity attacks, which are never declared, are rolled when they are triggered.

### Automatic steps

- **Death saves:** a dying combatant's death saving throw is added to second 1 of its plan.

### Initiative

Initiative no longer decides turn order. It is rolled for every combatant at the start of each
round, with the usual initiative dice (conditions such as Unseen and Incapacitated still add and
subtract dice), and is used to break ties and settle conflicts during reconciliation.

## Evaluation

For the current second, evaluation looks at every combatant's plan and produces a **proposed
changeset**:

- positions (movement along each path, one 5-foot square at a time);
- steps starting, continuing and finishing;
- reactions and opportunity attacks triggered;
- the effects of steps that finish this second: hits, misses, damage and conditions.

Everything in a second happens at the same time. Evaluation does not settle conflicts; the
proposed changeset may contain several, such as two creatures entering the same square.

## Reconciliation

Reconciliation turns the proposed changeset into a **committable changeset**:

- **Steps take effect** when their time runs out, against the target's state at that moment. An
  attack whose target is out of reach or range, out of sight, or already dead fails. A failed
  attack is still recorded, for the account of the battle.
- **Simultaneous outcomes stand.** Two duellists whose shots both finish in second 3 both hit,
  and both may fall.
- **Steps that never began are cancelled** if they can no longer happen (for example, their target
  died), and the rest of the plan moves up to fill the gap. A step that has begun must be
  finished: a combatant committed to a 3-second aimed shot spends the 3 seconds even if the target
  moves out of range.
- **Movement conflicts:** when two creatures would enter the same square, the higher initiative
  takes it. The other is rerouted along the next shortest path; rerouting costs whatever time the
  longer path takes.
- **Reactions take time from the plan.** A triggered reaction starts the next second (or when
  the action under way finishes) and pushes the rest of the plan back. Anything that no longer
  fits in the round is lost.
- **Durations:** effects measured in rounds are counted down.
- **Net change:** reconciliation works out each combatant's net change for the second (Hit Points,
  conditions, position), so resolution only has to write it.

Blocked paths are expected, not exceptional. A blocked creature's later steps are not predicted
or adjusted; each is checked when it takes effect, so a melee attack planned after a move that
was cut short simply fails if the target is out of reach.

## Resolution

Resolution writes the committed changeset to game state. It makes no decisions.

## End of round

- Unused declared reactions expire.
- The next round begins with planning, and a new initiative roll.

## Rules text

Rules text refers to rounds, not turns:

| Was                                  | Now                                  |
| ------------------------------------ | ------------------------------------ |
| "at the start of each of your turns" | "at the start of each round"         |
| "at the end of each of its turns"    | "at the end of each round"           |
| "until the start of your next turn"  | "until the end of the round"         |
| "until the end of its next turn"     | "until the end of the next round"    |
| "once per turn", "on its turn"       | "once per round", "during the round" |

Saving throws to end a condition are made at the end of each round.

## Logging

Every round is recorded in enough detail to reconstruct the encounter exactly: plans, hidden
rolls, each second's proposed and committed changesets, and how each conflict was settled. A
later feature will turn this log into narrative accounts of battles for player journals and
elsewhere.

## Worked example

Dr. Hale (defense 13) stands still. A bruiser with a fire axe stands next to her, a ghoul is 20
feet away, and a constable has a revolver. Everyone has Speed 30.

| Combatant | Plan                                                                       |
| --------- | -------------------------------------------------------------------------- |
| Ghoul     | Move 15 feet to Dr. Hale (seconds 1–3); bite Dr. Hale (second 4)           |
| Bruiser   | Defend Dr. Hale (second 1); reaction: axe attack (2 seconds)               |
| Constable | Aimed shot at the ghoul (seconds 1–3); move 10 feet to cover (seconds 4–5) |
| Dr. Hale  | Dodge (second 1)                                                           |

The ghoul's bite, the bruiser's counter-attack and the constable's shot are pre-rolled when
planned.

- **Second 1:** Dr. Hale dodges, so her defense is 17 until the end of the round. The bruiser
  takes up the guard. The ghoul moves 5 feet. The constable starts aiming.
- **Second 2:** the ghoul moves 5 feet.
- **Second 3:** the ghoul reaches Dr. Hale. The constable's aimed shot takes effect and wounds the
  ghoul.
- **Second 4:** the ghoul's bite takes effect against defense 17. The attack triggers the
  bruiser's Defend. The constable moves.
- **Second 5:** the bruiser swings the fire axe, a 2-second heavy weapon. The constable reaches
  cover.
- **Second 6:** the bruiser's counter-attack takes effect against the ghoul. The round ends.

If the constable's shot had killed the ghoul in second 3, its bite (which had not begun) would be
cancelled, and the bruiser's Defend would never trigger.

## Open questions

1. **Reactions triggered by conditions:** could a declared reaction trigger on a condition, such as
   "when my ally drops"? Only if the trigger can be declared precisely enough for the system to
   evaluate. Set aside for now.
2. **Narrative:** turning the encounter log into accounts of battles. A future feature.
