;(function() {
  "use strict"

  /**
   * Anti-spam functionality to append link with email address into DOM.
   *
   * @param user    Username part of the email address.
   * @param domain  Domain part of the email address.
   */
  $("[data-email]").each((index, el) => {
    const address = el
      .getAttribute("data-email")
      .split(",")
      .join("@")
    $(el)
      .attr("href", `mailto:${address}`)
      .html(address)
  })

  /**
   * Highlight functionality
   */
  // Store a separate map for each element.
  const elementMap = new Map()

  const uid = new ShortUniqueId()
  const urlParams = new URLSearchParams(location.search)
  const uuid = "f241f6fb-c90e-482b-bf8d-574daab4b303"

  let highlightConfig = {}
  let isHighlightingEnabled = false

  $("main.content")
    .find("h1, h2, h3, h4, h5, h6, p, ul > li, .position")
    .addClass("vala-host")
    .each(function() {
      // Give each host element a unique id.
      const elementId = uid.sequentialUUID()
      $(this).attr("data-vala-element-id", elementId)
      // Create a highlights container for this element.
      elementMap.set(elementId, new Map())
    })

  const appendHighlightColorStyle = color => {
    if (!color) return
    const style = document.createElement("style")
    const styleNode = (window.styleNode = document.createTextNode(
      `.mark { background-color: ${color} !important; }`
    ))
    style.type = "text/css"
    style.appendChild(styleNode)
    document.head.appendChild(style)
  }

  function fromEntries(iterable) {
    return [...iterable].reduce((obj, [key, val]) => {
      obj[key] = val
      return obj
    }, {})
  }

  const vala = $("body").vala({ cls: "mark" }, function(
    event,
    highlightId,
    range,
    done
  ) {
    if (!isHighlightingEnabled) return
    const elementId = $(this).attr("data-vala-element-id")
    const elementEntry = elementMap.get(elementId)

    // Use random highlight id
    const id = uid.randomUUID()

    elementEntry.set(id, {
      start: range.start,
      end: range.end,
      data: { id }
    })
    const hlConfigEntry = Object.values(fromEntries(elementEntry.entries()))
    highlightConfig.highlights = Object.assign({}, highlightConfig.highlights, {
      [elementId]: hlConfigEntry
    })
    updateUrlParams()
    done(hlConfigEntry)
  })

  if (urlParams.get("hl")) {
    highlightConfig = JSON.parse(atob(urlParams.get("hl")))
    if (highlightConfig.uuid !== uuid) {
      urlParams.delete("hl")
      window.history.replaceState({}, "", `${location.pathname}?${urlParams}`)
    } else {
      for (const elementId in highlightConfig.highlights) {
        const elementDom = $(`.vala-host[data-vala-element-id=${elementId}]`)
        const elementEntry = elementMap.get(elementId)
        highlightConfig.highlights[elementId].forEach(highlightEntry =>
          elementEntry.set(highlightEntry.data.id, highlightEntry)
        )
        elementDom.html(
          vala.render(elementDom.text(), Array.from(elementEntry.values()))
        )
      }
      appendHighlightColorStyle(highlightConfig.color)
    }
  }

  const updateUrlParams = () => {
    urlParams.set(
      "hl",
      btoa(JSON.stringify(Object.assign(highlightConfig, { uuid })))
    )
    window.history.replaceState({}, "", `${location.pathname}?${urlParams}`)
  }

  window.enableHighlighting = color => {
    if (color && color !== highlightConfig.color) {
      highlightConfig.color = color
      appendHighlightColorStyle(color)
      updateUrlParams()
    }
    if (isHighlightingEnabled) return
    isHighlightingEnabled = true
    $("main.content").addClass("is-marking-enabled")

    $("body").on("mouseenter", ".mark", function(e) {
      $(this).css("cursor", "pointer")
    })

    // Monitor for any mouseup events on vala-jq highlights
    // so that they can be deleted when clicked.
    $("body").on("mouseup", ".mark", function(e) {
      // Get the parent vala-host paragraph and its unique id.
      const elementDom = $(this).closest(".vala-host")
      const elementId = elementDom.attr("data-vala-element-id")
      // Get the paragraph's map object.
      const elementEntry = elementMap.get(elementId)
      // Get the id of this highlight.
      const id = $(this).attr("data-id")

      // Remove the highlight.
      elementEntry.delete(id)
      // Rerender the paragraph text.
      elementDom.html(
        vala.render(elementDom.text(), Array.from(elementEntry.values()))
      )
      const hlConfigEntry = Object.values(fromEntries(elementEntry.entries()))
      if (hlConfigEntry.length) {
        highlightConfig.highlights[elementId] = hlConfigEntry
      } else {
        delete highlightConfig.highlights[elementId]
      }
      updateUrlParams()
      e.stopPropagation()
    })
  }
})()
