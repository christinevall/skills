# Gaps between Figma and the code

Where the Figma library and the code do not match, and what is not known yet.
It is where "in sync" stops being a claim: anything not listed here is
expected to match, so a difference that is not written down is a bug.

**Write an entry whenever** you skip something, build something by hand, find
a mismatch, or cannot check something. Rule of thumb: if a designer opening
the file would be surprised, it belongs here. Never fake a match in Figma to
avoid an entry.

**Six kinds**, and every entry carries its mark:

| Mark | Kind | Where it goes | Until |
| --- | --- | --- | --- |
| 🎨 | **Figma limit**: Figma cannot express what the code does | *Different on purpose* | For good, or until Figma can |
| 📌 | **Our choice**: Figma could show it, we decided not to (not in the contract: hover, motion, validation states, parts left out) | *Different on purpose* or *Left out on purpose* | The decision changes |
| 🔄 | **Figma behind**: the code changed, the library has not caught up | *Open*, with the step that updates it | The library is updated |
| 🐞 | **Code bug**: found while mirroring; the code is wrong, not Figma | *Open*, and fix it in the code | The fix is merged |
| ❓ | **Not decided**: the code does not answer the question | *Open*, with the question | Someone decides; then *Different on purpose* or fixed |
| 👁 | **Not checked**: done, but not verified | *Open*, with what would check it | It is checked |

## Different on purpose

Permanent, marked 🎨 or 📌 (a 🐞 or ❓ row points to its *Open* entry). Each
row says what the code does, what Figma does instead, and why.

### Tokens

| | Code | Figma | Why |
| --- | --- | --- | --- |
| 🎨 | | | |

### Components

| | Component | Code | Figma | Why |
| --- | --- | --- | --- | --- |
| 🎨 | | | | |
| 📌 | | | | |

## Left out on purpose

Code that has no Figma counterpart at all, and why.

| | Code | Why |
| --- | --- | --- |
| 📌 | | |

## Open

Temporary. Newest first, dated, one mark each. Say what would close it. Delete
an entry when it is closed; git keeps the history.

- 🔄 **YYYY-MM-DD, <what>.** <What changed in code, and the step that updates Figma.>
- 🐞 **YYYY-MM-DD, <what>.** <What happens, where it was found, what to do next.>
- ❓ **YYYY-MM-DD, <question>.** <The options, and who decides.>
- 👁 **YYYY-MM-DD, not checked: <what>.** <What would check it.>
