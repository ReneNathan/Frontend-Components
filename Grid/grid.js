/**
 * Constrói e gerencia uma grade (grid) paginada customizada com controles de navegação.
 *
 * Essa função associa eventos a elementos HTML relacionados a uma grid e realiza
 * chamadas para uma API que retorna dados paginados. Os dados retornados são exibidos
 * dinamicamente em uma tabela HTML, com base nos campos especificados.
 *
 * A estrutura HTML da grid deve conter IDs padronizados com base no `gridId`
 * fornecido. Ou seja, todos os elementos que compõem a grid (tabela, botões de navegação,
 * indicadores de página, etc.) devem ter IDs no formato `${gridId}_seletor`.
 *
 * @param {string} gridId - Prefixo usado nos IDs dos elementos HTML da grid.
 * @param {string} fetchUrlBase - URL base da API. A URL completa será `${fetchUrlBase}/{pageSize}/{pageNumber}`.
 * @param {string[]} [camposParaExibir=[]] - Lista de campos específicos a serem exibidos na tabela (em ordem).
 *                                           Se vazio, nada será exibido. Os nomes devem corresponder às chaves do objeto retornado pela API.
 */

async function build_custom_grid(gridId, fetchUrlBase, camposParaExibir = []) {

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
      let resp = await fetch(url);
      resp = await resp.json();
      const data = resp.Details;

      // preenche a tabela
      tableBody.innerHTML = "";
      data.Results.forEach((rowData, i) => {
        const row = tableBody.insertRow();
        camposParaExibir.forEach((campo) => {
          const cell = row.insertCell();
          cell.innerText = rowData[campo] ?? "";
        });
      });

      // atualiza contadores
      elPage.innerText = data.PageNumber;
      elTotalPg.innerText = data.TotalNumberOfPages;
      elTotalRec.innerText = data.TotalNumberOfRecords;

      // ajusta numeradores
      adjustNumerators(data.PageNumber, data.TotalNumberOfPages);
	  //handle_table_{{TABLE_NAME}}_tr_click() 
    }
    catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erro ao carregar a tabela!",
        text: "Por favor tente novamente mais tarde. | Erro: " + err,
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
  await loadPage(+elPage.innerText);
}

function handle_table_{{TABLE_NAME}}_tr_click() {
  const grid_hospitais_table = document.getElementById("grid_hospitais_table");
  const table_rows = grid_hospitais_table.querySelectorAll("tbody tr");


  table_rows.forEach((row) => {
    row.addEventListener("click", () => {
      const cell_hospital_name = row.querySelector("td:nth-child(1)");
      const cell_hospital_endereco = row.querySelector("td:nth-child(2)");
      const cell_hospital_bairro = row.querySelector("td:nth-child(3)");
      const cell_hospital_cidade = row.querySelector("td:nth-child(4)");
      document.getElementById("nome_unidade_saude").value = cell_hospital_name.innerHTML;
      document.getElementById("endereco_unidade_saude").value = cell_hospital_endereco.innerHTML;
      document.getElementById("bairro_unidade_saude").value = cell_hospital_bairro.innerHTML;
      document.getElementById("municipio_unidade_saude").value = cell_hospital_cidade.innerHTML;

      const btn_close_modal_select_hospital = document.getElementById("btn_close_modal_select_hospital");
      btn_close_modal_select_hospital.click();
    });
  });
}
