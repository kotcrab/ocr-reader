import * as React from "react"

export default function SelectionColorOverride() {
  return <style dangerouslySetInnerHTML={{
    __html: [
      "svg text::selection {",
      "color: transparent;",
      "background-color: rgba(130, 130, 130, .5);",
      "}",
    ].join("\n"),
  }}>
  </style>
}
