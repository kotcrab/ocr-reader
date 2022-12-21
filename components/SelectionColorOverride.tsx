import * as React from "react"

export default function SelectionColorOverride() {
  return <style dangerouslySetInnerHTML={{
    __html: [
      "::selection {",
      "color: transparent;",
      "background-color: rgba(255, 255, 255, .5);",
      "}",
    ].join("\n"),
  }}>
  </style>
}
