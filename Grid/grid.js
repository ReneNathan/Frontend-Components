/**
 * Constrói e gerencia uma grade (grid) paginada customizada com controles de navegação.
 *
 * Essa função associa eventos a elementos HTML relacionados a uma grade e realiza
 * chamadas para uma API para buscar e exibir dados paginados em uma tabela.
 *
 * A grid deve possuir uma estrutura HTML com IDs padronizados baseados no `gridId`; ou seja, **use o mesmo `gridId` para todos os elementos relacionados no HTML.**
 *
 * @param {string} gridId - Prefixo base usado nos IDs dos elementos HTML da grid.
 * @param {string} fetchUrlBase - URL base da API para buscar os dados. A função montará a URL final no formato `${fetchUrlBase}/{pageSize}/{pageNumber}`.
 */
function build_custom_grid(gridId, fetchUrlBase) {
  const container = document.getElementById(`${gridId}_container`);
  const select = container.querySelector(`#${gridId}_select`);
  const tableBody = container.querySelector(`#${gridId}_table tbody`);
  const elPage = container.querySelector(`#${gridId}_current_page`);
  const elTotalPg = container.querySelector(`#${gridId}_total_pages`);
  const elTotalRec = container.querySelector(`#${gridId}_total_records`);
  const btnNext = container.querySelector(`#${gridId}_next`);
  const btnPrev = container.querySelector(`#${gridId}_prev`);
  const btnRefresh = container.querySelector(`#${gridId}_refresh`);
  const numerators = [
    container.querySelector(`#${gridId}_num_1`),
    container.querySelector(`#${gridId}_num_2`),
    container.querySelector(`#${gridId}_num_3`),
    container.querySelector(`#${gridId}_num_4`),
    container.querySelector(`#${gridId}_num_5`)
  ];

  async function loadPage(pageNumber) {
    try {
      const pageSize = select.value;
      const url = `${fetchUrlBase}/${pageSize}/${pageNumber}`;
      const resp = await fetch(url);
      const data = await resp.json();

      // preenche a tabela
      tableBody.innerHTML = "";
      data.Results.forEach((rowData, i) => {
        const row = tableBody.insertRow();
        Object.values(rowData).forEach((cellValue) => {
          const cell = row.insertCell();
          cell.innerText = cellValue;
        });
      });

      // atualiza contadores
      elPage.innerText = data.PageNumber;
      elTotalPg.innerText = data.TotalNumberOfPages;
      elTotalRec.innerText = data.TotalNumberOfRecords;

      // ajusta numeradores
      adjustNumerators(data.PageNumber, data.TotalNumberOfPages);
    }
    catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erro ao carregar a tabela!",
        text: "Por favor tente novamente mais tarde.",
      });
    }
  }

  function adjustNumerators(current, total) {
    // sempre atualiza o quinto com total
    numerators[4].innerText = total;

    // decide visibilidade
    if (total < 5) {
      numerators.forEach((num, idx) => {
        if (idx >= total) num.classList.add("is_hidden");
      });
    } else {
      numerators.forEach(num => num.classList.remove("is_hidden"));
    }

    // limpa selecionados
    numerators.forEach(num => num.classList.remove("is_selected"));

    // marca selecionado e ajusta textos
    if (current === 1) {
      numerators[0].classList.add("is_selected");
      [2, 3, 4].forEach((n, i) => numerators[i + 1].innerText = i + 2);
    }
    else if (current === 2) {
      numerators[1].classList.add("is_selected");
    }
    else if (current === total) {
      numerators[4].classList.add("is_selected");
      [total - 3, total - 2, total - 1].forEach((v, i) => numerators[i + 1].innerText = v);
    }
    else if (current === total - 1) {
      numerators[3].classList.add("is_selected");
    }
    else {
      numerators[2].classList.add("is_selected");
      numerators[1].innerText = current - 1;
      numerators[2].innerText = current;
      numerators[3].innerText = current + 1;
    }
  }

  // wiring dos botões
  btnNext.addEventListener("click", () => {
    const cur = +elPage.innerText;
    if (cur < +elTotalPg.innerText) loadPage(cur + 1);
  });
  btnPrev.addEventListener("click", () => {
    const cur = +elPage.innerText;
    if (cur > 1) loadPage(cur - 1);
  });
  btnRefresh.addEventListener("click", () => loadPage(1));
  select.addEventListener("change", () => btnRefresh.click());
  numerators.forEach(numEl =>
    numEl.addEventListener("click", e => loadPage(+e.target.innerText))
  );

  // carga inicial
  loadPage(+elPage.innerText);
}
