let observer: MutationObserver | null = null

export function applyAutoComplete(off: boolean) {
  document.querySelectorAll('input, select, textarea').forEach((el) => {
    if (off) el.setAttribute('autocomplete', 'off')
    else el.removeAttribute('autocomplete')
  })
}

export function watchAutoComplete(target: HTMLElement, off: boolean) {
  stopAutoComplete()
  applyAutoComplete(off)
  observer = new MutationObserver(() => applyAutoComplete(off))
  observer.observe(target, { childList: true, subtree: true })
}

export function stopAutoComplete() {
  if (observer) { observer.disconnect(); observer = null }
}
