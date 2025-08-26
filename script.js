document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('dogForm');
  const questionarioDiv = document.getElementById('questionario');
  let datiUtente = {};

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Salva i dati anagrafici del form
    const formData = new FormData(form);
    datiUtente = {
      nome_proprietario: formData.get('nome_proprietario'),
      nome_cane: formData.get('nome_cane'),
      razza_cane: formData.get('razza_cane'),
      eta_cane: formData.get('eta_cane'),
      risposte: {}
    };

    // 2. Nasconde il form iniziale
    form.classList.add('hidden');

    // 3. Carica JSON delle domande
    const res = await fetch('./data/questionario.json');
    const data = await res.json();

    // 4. Mostra domande per il proprietario
    mostraDomande('proprietario', data.questionario.proprietario);
  });

  function mostraDomande(tipo, domande) {
    questionarioDiv.innerHTML = `<h2 class="text-xl font-bold mb-4">${tipo === 'proprietario' ? 'Domande per il Proprietario' : 'Domande sul Cane'}</h2>`;

    const form = document.createElement('form');
    form.classList.add('space-y-4');

    domande.forEach((q, index) => {
      const div = document.createElement('div');
      div.classList.add('border', 'p-3', 'rounded', 'bg-white', 'shadow');

      const label = document.createElement('label');
      label.classList.add('block', 'font-medium', 'mb-1');
      label.textContent = `${index + 1}. ${q.domanda}`;

      const select = document.createElement('select');
      select.name = q.id;
      select.classList.add('w-full', 'p-2', 'border', 'rounded');
      [1, 2, 3, 4, 5].forEach(v => {
        const option = document.createElement('option');
        option.value = v;
        option.textContent = `${v} - ${valoreScala(v)}`;
        select.appendChild(option);
      });

      div.appendChild(label);
      div.appendChild(select);
      form.appendChild(div);
    });

    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = tipo === 'proprietario' ? 'Continua con domande sul cane →' : 'Genera Risposta AI';
    btn.classList.add('w-full', 'bg-blue-600', 'text-white', 'p-2', 'rounded', 'hover:bg-blue-700', 'transition');
    form.appendChild(btn);

    questionarioDiv.appendChild(form);
    questionarioDiv.classList.remove('hidden');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const risposte = {};
      for (const [key, value] of formData.entries()) {
        risposte[key] = parseInt(value);
      }

      datiUtente.risposte[tipo] = risposte;

      if (tipo === 'proprietario') {
        // Carica domande cane
        const res = await fetch('./data/questionario.json');
        const data = await res.json();
        mostraDomande('cane', data.questionario.cane);
      } else {
        // Mostra JSON raccolto e prepara chiamata al backend
        console.log('Risposte finali:', datiUtente);
        mostraPulsanteGenera(datiUtente);
      }
    });
  }

  function valoreScala(val) {
    const descrizioni = {
      1: 'Mai',
      2: 'Raramente',
      3: 'A volte',
      4: 'Spesso',
      5: 'Sempre'
    };
    return descrizioni[val] || val;
  }

function mostraPulsanteGenera(dati) {
  questionarioDiv.innerHTML = `
    <div class="p-4 bg-green-100 border border-green-400 rounded mb-4">
      <p class="text-green-900 font-semibold">Hai completato tutte le domande!</p>
    </div>
    <button id="generaAi" class="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition mb-4">
      🔍 Genera Risposta AI
    </button>
    <div id="aiOutput" class="mt-4 text-sm text-gray-700 whitespace-pre-line"></div>
  `;

  document.getElementById('generaAi').addEventListener('click', async () => {
    const output = document.getElementById('aiOutput');
    output.innerHTML = "⏳ Generazione in corso...";

    try {
      const res = await fetch("https://dog-rank-backend.onrender.com/genera", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dati)
      });

      const result = await res.json();

      if (result.risposta_ai) {
        output.innerHTML = result.risposta_ai;
      } else {
        output.innerHTML = "⚠️ Errore nella risposta del server.";
        console.error(result);
      }
    } catch (err) {
      output.innerHTML = "❌ Errore nella richiesta al backend.";
      console.error(err);
    }
  });
}

});

