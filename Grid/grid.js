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
    // limpa todos
    numerators.forEach((num, idx) => {
      num.classList.add("is_hidden");
      num.classList.remove("is_selected");
      num.innerText = "";
    });

    // define quantos numerators serão visíveis
    const visibleCount = Math.min(total, numerators.length);

    if (total <= 5) {
      // Mostra sequencialmente de 1 até total
      for (let i = 0; i < visibleCount; i++) {
        numerators[i].classList.remove("is_hidden");
        numerators[i].innerText = i + 1;

        if (current === i + 1) {
          numerators[i].classList.add("is_selected");
        }
      }
    } else {
      // Sempre mostra 5 blocos
      let pages = [];

      if (current <= 2) {
        pages = [1, 2, 3, 4, total];
      } else if (current >= total - 1) {
        pages = [total - 3, total - 2, total - 1, total, total];
      } else {
        pages = [current - 1, current, current + 1, total - 1, total];
      }

      for (let i = 0; i < numerators.length; i++) {
        numerators[i].classList.remove("is_hidden");
        numerators[i].innerText = pages[i];

        if (current === pages[i]) {
          numerators[i].classList.add("is_selected");
        }
      }
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
