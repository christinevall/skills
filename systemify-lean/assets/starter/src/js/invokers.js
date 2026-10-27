// Fallback for invoker commands (command / commandfor) in browsers without
// them. Does nothing where they are supported. Covers show-modal and close only.
if (!('command' in HTMLButtonElement.prototype)) {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[commandfor]');
    const target = button && document.getElementById(button.getAttribute('commandfor'));
    if (!(target instanceof HTMLDialogElement)) return;
    const command = button.getAttribute('command');
    if (command === 'show-modal') target.showModal();
    if (command === 'close') target.close();
  });
}
