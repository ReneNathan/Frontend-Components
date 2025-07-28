function build_modal(modal_id, btn_open_modal_id, btn_close_modal_id) {
  const modal = document.getElementById(modal_id);
  const btn_open_modal = document.getElementById(btn_open_modal_id);
  const btn_close_modal = document.getElementById(btn_close_modal_id);

  btn_open_modal.onclick = function () {
    modal.style.display = "block";
    setTimeout(() => {
      modal.classList.add("show");
    }, 10); //delay para ter animação
  }

  btn_close_modal.onclick = function () {
    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
    }, 500); //delay para ter animação
  }
}