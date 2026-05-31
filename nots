<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bloc de Notas</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f8f7f4;--surface:#fff;--surface2:#f1f0eb;
  --border:#e0ddd5;--border2:#c8c5bc;
  --text:#1a1a18;--text2:#6b6a66;--text3:#9e9d99;
  --accent:#7f77dd;--accent-bg:#eeedfe;--accent-text:#3c3489;
  --green:#3b6d11;--green-bg:#eaf3de;
  --amber:#854f0b;--amber-bg:#faeeda;
  --red:#a32d2d;--red-bg:#fcebeb;
  --teal:#0f6e56;--teal-bg:#e1f5ee;
  --radius:10px;--radius-sm:6px;
}
@media(prefers-color-scheme:dark){
  :root{
    --bg:#1a1a18;--surface:#242422;--surface2:#2e2e2b;
    --border:#3a3a36;--border2:#4a4a46;
    --text:#f0efea;--text2:#a8a7a2;--text3:#6b6a66;
    --accent:#afa9ec;--accent-bg:#26215c;--accent-text:#cecbf6;
    --green:#c0dd97;--green-bg:#173404;
    --amber:#fac775;--amber-bg:#412402;
    --red:#f7c1c1;--red-bg:#501313;
    --teal:#9fe1cb;--teal-bg:#04342c;
  }
}
body{font-family:system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex;flex-direction:column;font-size:14px}
.app-bar{background:var(--surface);border-bottom:0.5px solid var(--border);padding:0 1rem;display:flex;align-items:center;gap:0.5rem;height:52px;position:sticky;top:0;z-index:100}
.app-title{font-size:16px;font-weight:500;color:var(--text);display:flex;align-items:center;gap:8px;margin-right:auto}
.app-title i{color:var(--accent);font-size:20px}
.btn{background:transparent;border:0.5px solid var(--border2);border-radius:var(--radius-sm);padding:6px 12px;color:var(--text);cursor:pointer;font-size:13px;display:inline-flex;align-items:center;gap:6px;transition:background .15s,transform .1s;white-space:nowrap}
.btn:hover{background:var(--surface2)}
.btn:active{transform:scale(0.97)}
.btn-accent{background:var(--accent-bg);border-color:var(--accent);color:var(--accent-text)}
.btn-danger{background:var(--red-bg);border-color:var(--red);color:var(--red)}
.btn-sm{padding:4px 9px;font-size:12px}
.btn i{font-size:15px}
.layout{display:flex;flex:1;min-height:0;height:calc(100vh - 52px)}
.sidebar{width:240px;min-width:240px;background:var(--surface);border-right:0.5px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.sidebar-header{padding:12px;border-bottom:0.5px solid var(--border);display:flex;flex-direction:column;gap:8px}
.search-box{background:var(--surface2);border:0.5px solid var(--border);border-radius:var(--radius-sm);padding:7px 10px;display:flex;align-items:center;gap:6px;color:var(--text2)}
.search-box input{background:none;border:none;outline:none;color:var(--text);font-size:13px;flex:1;width:100%}
.search-box input::placeholder{color:var(--text3)}
.notes-list{flex:1;overflow-y:auto;padding:8px}
.note-item{padding:10px 12px;border-radius:var(--radius-sm);cursor:pointer;margin-bottom:4px;border:0.5px solid transparent;transition:background .15s}
.note-item:hover{background:var(--surface2)}
.note-item.active{background:var(--accent-bg);border-color:var(--accent)}
.note-item-title{font-size:13px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.note-item-preview{font-size:12px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
.note-item-meta{font-size:11px;color:var(--text3);margin-top:4px;display:flex;align-items:center;gap:4px}
.tag-badge{font-size:10px;padding:2px 7px;border-radius:999px;font-weight:500}
.tag-nota{background:var(--accent-bg);color:var(--accent-text)}
.tag-tabla{background:var(--teal-bg);color:var(--teal)}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--bg)}
.editor-area{flex:1;overflow-y:auto;padding:2rem}
.editor-wrap{max-width:780px;margin:0 auto;background:var(--surface);border-radius:var(--radius);border:0.5px solid var(--border);overflow:hidden}
.note-title-input{width:100%;background:none;border:none;outline:none;font-size:22px;font-weight:500;color:var(--text);padding:1.25rem 1.5rem 0.75rem;border-bottom:0.5px solid var(--border)}
.note-title-input::placeholder{color:var(--text3)}
.toolbar{padding:8px 1.5rem;border-bottom:0.5px solid var(--border);display:flex;align-items:center;gap:4px;flex-wrap:wrap;background:var(--surface2)}
.toolbar-btn{background:none;border:none;cursor:pointer;padding:5px 7px;border-radius:var(--radius-sm);color:var(--text2);font-size:14px;display:inline-flex;align-items:center;transition:background .15s,color .15s}
.toolbar-btn:hover{background:var(--border);color:var(--text)}
.toolbar-btn.active{background:var(--accent-bg);color:var(--accent-text)}
.toolbar-sep{width:0.5px;height:20px;background:var(--border2);margin:0 4px}
.content-editor{padding:1.25rem 1.5rem 2rem;min-height:300px;outline:none;line-height:1.75;color:var(--text);font-size:15px}
.content-editor:empty::before{content:attr(data-placeholder);color:var(--text3)}
.content-editor h1{font-size:20px;font-weight:500;margin:1rem 0 0.5rem}
.content-editor h2{font-size:17px;font-weight:500;margin:0.8rem 0 0.4rem}
.content-editor ul,.content-editor ol{padding-left:1.5rem;margin:0.5rem 0}
.content-editor blockquote{border-left:3px solid var(--accent);padding-left:1rem;color:var(--text2);margin:0.5rem 0}
.content-editor table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:14px}
.content-editor th{background:var(--surface2);font-weight:500;text-align:left}
.content-editor th,.content-editor td{border:0.5px solid var(--border);padding:8px 12px}
.content-editor tr:nth-child(even) td{background:var(--surface2)}
.mode-tabs{display:flex;gap:4px;padding:0 1.5rem;border-bottom:0.5px solid var(--border)}
.mode-tab{padding:9px 16px;font-size:13px;color:var(--text2);cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;margin-bottom:-0.5px;transition:color .15s}
.mode-tab.active{color:var(--accent-text);border-bottom-color:var(--accent);font-weight:500}
.table-editor{padding:1.25rem 1.5rem 2rem;display:none}
.table-editor.visible{display:block}
.table-controls{display:flex;align-items:center;gap:8px;margin-bottom:1rem;flex-wrap:wrap}
.input-sm{background:var(--surface2);border:0.5px solid var(--border);border-radius:var(--radius-sm);padding:6px 10px;color:var(--text);font-size:13px;outline:none;width:70px}
.input-sm:focus{border-color:var(--accent)}
.select-sm{background:var(--surface2);border:0.5px solid var(--border);border-radius:var(--radius-sm);padding:6px 10px;color:var(--text);font-size:13px;outline:none;cursor:pointer}
.table-scroll{overflow-x:auto}
.editable-table{border-collapse:collapse;min-width:100%;font-size:14px}
.editable-table th,.editable-table td{border:0.5px solid var(--border);padding:0;min-width:120px}
.editable-table th{background:var(--surface2)}
.cell-input{width:100%;background:none;border:none;outline:none;padding:8px 10px;color:var(--text);font-size:14px;font-family:inherit}
.editable-table th .cell-input{font-weight:500}
.editable-table tr:nth-child(even) td{background:var(--surface2)}
.editable-table .del-row,.editable-table .del-col{background:none;border:none;cursor:pointer;color:var(--text3);padding:2px 5px;border-radius:3px;font-size:12px;display:inline-flex;align-items:center}
.editable-table .del-row:hover,.editable-table .del-col:hover{color:var(--red);background:var(--red-bg)}
.col-header{display:flex;align-items:center;gap:4px}
.row-actions{vertical-align:middle;padding:0 6px!important;width:28px;min-width:28px;background:var(--bg)!important;border:none!important}
.status-bar{padding:6px 1.5rem;display:flex;align-items:center;gap:12px;background:var(--surface);border-top:0.5px solid var(--border);font-size:12px;color:var(--text3)}
.saved-indicator{display:flex;align-items:center;gap:5px}
.dot{width:7px;height:7px;border-radius:50%;background:var(--green)}
.dot.saving{background:var(--amber)}
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:1rem;color:var(--text3)}
.empty-state i{font-size:48px;opacity:.4}
.empty-state p{font-size:15px}
.modal-bg{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:200;align-items:center;justify-content:center}
.modal-bg.open{display:flex}
.modal{background:var(--surface);border-radius:var(--radius);border:0.5px solid var(--border);padding:1.5rem;width:360px;max-width:95vw}
.modal h3{font-size:16px;font-weight:500;margin-bottom:1rem}
.modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:1.25rem}
.template-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:1rem}
.template-card{background:var(--surface2);border:0.5px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;cursor:pointer;transition:border-color .15s}
.template-card:hover{border-color:var(--accent)}
.template-card .tc-icon{font-size:20px;margin-bottom:4px;color:var(--accent)}
.template-card .tc-name{font-size:13px;font-weight:500}
.template-card .tc-desc{font-size:11px;color:var(--text3);margin-top:2px}
.label{font-size:12px;color:var(--text2);margin-bottom:4px;display:block}
input[type=text].full{width:100%;background:var(--surface2);border:0.5px solid var(--border);border-radius:var(--radius-sm);padding:8px 10px;color:var(--text);font-size:14px;outline:none}
input[type=text].full:focus{border-color:var(--accent)}
</style>
</head>
<body>

<!-- Barra superior -->
<div class="app-bar">
  <div class="app-title">
    <i class="ti ti-notebook" aria-hidden="true"></i>
    Mis notas
  </div>
  <button class="btn btn-accent" id="btn-new-note">
    <i class="ti ti-plus"></i>Nueva nota
  </button>
  <button class="btn" id="btn-new-table">
    <i class="ti ti-table-plus"></i>Nueva tabla
  </button>
</div>

<!-- Layout principal -->
<div class="layout">

  <!-- Sidebar / lista de notas -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="search-box">
        <i class="ti ti-search" aria-hidden="true"></i>
        <input type="text" id="search-input" placeholder="Buscar notas...">
      </div>
    </div>
    <div class="notes-list" id="notes-list">
      <div class="empty-state" style="margin-top:2rem">
        <i class="ti ti-notes" aria-hidden="true"></i>
        <p>Sin notas aún</p>
      </div>
    </div>
  </aside>

  <!-- Área principal del editor -->
  <main class="main" id="main-area">

    <!-- Estado vacío -->
    <div class="empty-state" id="empty-main">
      <i class="ti ti-notebook" aria-hidden="true"></i>
      <p>Selecciona o crea una nota</p>
      <button class="btn btn-accent" id="btn-start">
        <i class="ti ti-plus"></i>Crear primera nota
      </button>
    </div>

    <!-- Panel del editor (oculto hasta abrir nota) -->
    <div id="editor-panel" style="display:none;flex-direction:column;height:100%">

      <!-- Tabs de modo + botón eliminar -->
      <div style="padding:10px 1.5rem;border-bottom:0.5px solid var(--border);background:var(--surface);display:flex;align-items:center;gap:8px">
        <div class="mode-tabs" style="padding:0;border:none;flex:1">
          <button class="mode-tab active" data-mode="text">
            <i class="ti ti-pencil" style="margin-right:4px"></i>Nota
          </button>
          <button class="mode-tab" data-mode="table">
            <i class="ti ti-table" style="margin-right:4px"></i>Tabla
          </button>
        </div>
        <button class="btn btn-sm" id="btn-delete-note" title="Eliminar nota">
          <i class="ti ti-trash"></i>
        </button>
      </div>

      <!-- Panel: editor de texto -->
      <div class="editor-area" id="text-panel">
        <div class="editor-wrap">
          <input type="text" class="note-title-input" id="note-title" placeholder="Título de la nota...">
          <div class="toolbar" id="toolbar">
            <button class="toolbar-btn" data-cmd="bold" title="Negrita"><i class="ti ti-bold"></i></button>
            <button class="toolbar-btn" data-cmd="italic" title="Cursiva"><i class="ti ti-italic"></i></button>
            <button class="toolbar-btn" data-cmd="underline" title="Subrayado"><i class="ti ti-underline"></i></button>
            <span class="toolbar-sep"></span>
            <button class="toolbar-btn" data-cmd="formatBlock" data-val="h1" title="Título 1"><i class="ti ti-h-1"></i></button>
            <button class="toolbar-btn" data-cmd="formatBlock" data-val="h2" title="Título 2"><i class="ti ti-h-2"></i></button>
            <span class="toolbar-sep"></span>
            <button class="toolbar-btn" data-cmd="insertUnorderedList" title="Lista con viñetas"><i class="ti ti-list"></i></button>
            <button class="toolbar-btn" data-cmd="insertOrderedList" title="Lista numerada"><i class="ti ti-list-numbers"></i></button>
            <button class="toolbar-btn" data-cmd="formatBlock" data-val="blockquote" title="Cita"><i class="ti ti-blockquote"></i></button>
            <span class="toolbar-sep"></span>
            <button class="toolbar-btn" data-cmd="justifyLeft" title="Alinear izquierda"><i class="ti ti-align-left"></i></button>
            <button class="toolbar-btn" data-cmd="justifyCenter" title="Centrar"><i class="ti ti-align-center"></i></button>
            <button class="toolbar-btn" data-cmd="justifyRight" title="Alinear derecha"><i class="ti ti-align-right"></i></button>
            <span class="toolbar-sep"></span>
            <button class="toolbar-btn" data-cmd="removeFormat" title="Limpiar formato"><i class="ti ti-clear-formatting"></i></button>
          </div>
          <div
            class="content-editor"
            id="content-editor"
            contenteditable="true"
            data-placeholder="Escribe tu nota aquí...">
          </div>
        </div>
      </div>

      <!-- Panel: editor de tablas -->
      <div id="table-panel" class="editor-area" style="display:none">
        <div class="editor-wrap">
          <input type="text" class="note-title-input" id="table-title" placeholder="Título de la tabla...">
          <div style="padding:10px 1.5rem;border-bottom:0.5px solid var(--border);background:var(--surface2);display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-size:13px;color:var(--text2)">Filas:</span>
            <input class="input-sm" type="number" id="add-rows" value="1" min="1" max="20" style="width:60px">
            <button class="btn btn-sm" id="btn-add-rows">
              <i class="ti ti-plus"></i>Agregar filas
            </button>
            <span class="toolbar-sep"></span>
            <span style="font-size:13px;color:var(--text2)">Cols:</span>
            <input class="input-sm" type="number" id="add-cols" value="1" min="1" max="20" style="width:60px">
            <button class="btn btn-sm" id="btn-add-cols">
              <i class="ti ti-plus"></i>Agregar cols
            </button>
          </div>
          <div class="table-editor visible">
            <div class="table-scroll">
              <table class="editable-table" id="editable-table">
                <thead id="table-head"></thead>
                <tbody id="table-body"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra de estado -->
      <div class="status-bar">
        <div class="saved-indicator">
          <div class="dot" id="save-dot"></div>
          <span id="save-status">Guardado</span>
        </div>
        <span id="word-count">0 palabras</span>
        <span id="note-date" style="margin-left:auto"></span>
      </div>

    </div><!-- /editor-panel -->
  </main>
</div><!-- /layout -->

<!-- Modal: nueva nota de texto -->
<div class="modal-bg" id="modal-new">
  <div class="modal">
    <h3>Nueva nota</h3>
    <label class="label" for="new-note-title">Título</label>
    <input type="text" id="new-note-title" class="full" placeholder="Ej: Ideas del proyecto">
    <div class="modal-actions">
      <button class="btn" id="modal-cancel">Cancelar</button>
      <button class="btn btn-accent" id="modal-create">
        <i class="ti ti-check"></i>Crear
      </button>
    </div>
  </div>
</div>

<!-- Modal: nueva tabla con plantillas -->
<div class="modal-bg" id="modal-table">
  <div class="modal">
    <h3>Nueva tabla</h3>
    <label class="label">Plantilla</label>
    <div class="template-grid">
      <div class="template-card" data-tpl="horario">
        <div class="tc-icon"><i class="ti ti-clock"></i></div>
        <div class="tc-name">Horario</div>
        <div class="tc-desc">Horas, días y actividades</div>
      </div>
      <div class="template-card" data-tpl="rutina">
        <div class="tc-icon"><i class="ti ti-repeat"></i></div>
        <div class="tc-name">Rutina</div>
        <div class="tc-desc">Actividades y hábitos diarios</div>
      </div>
      <div class="template-card" data-tpl="comidas">
        <div class="tc-icon"><i class="ti ti-salad"></i></div>
        <div class="tc-name">Plan de comidas</div>
        <div class="tc-desc">Desayuno, comida y cena</div>
      </div>
      <div class="template-card" data-tpl="tareas">
        <div class="tc-icon"><i class="ti ti-checklist"></i></div>
        <div class="tc-name">Tareas</div>
        <div class="tc-desc">Lista con prioridad y estado</div>
      </div>
      <div class="template-card" data-tpl="gastos">
        <div class="tc-icon"><i class="ti ti-coin"></i></div>
        <div class="tc-name">Gastos</div>
        <div class="tc-desc">Registro de ingresos y egresos</div>
      </div>
      <div class="template-card" data-tpl="libre">
        <div class="tc-icon"><i class="ti ti-table"></i></div>
        <div class="tc-name">Libre</div>
        <div class="tc-desc">Tabla vacía personalizada</div>
      </div>
    </div>
    <label class="label" for="table-note-title-input">Título</label>
    <input type="text" id="table-note-title-input" class="full" placeholder="Ej: Mi horario semanal">
    <div class="modal-actions">
      <button class="btn" id="modal-table-cancel">Cancelar</button>
      <button class="btn btn-accent" id="modal-table-create">
        <i class="ti ti-check"></i>Crear tabla
      </button>
    </div>
  </div>
</div>

<script>
/* ===================================================
   BLOC DE NOTAS — IndexedDB + Editor de texto + Tablas
   =================================================== */

const DB_NAME  = 'NotasDB';
const STORE    = 'notas';
const DB_VER   = 1;

let db, notes = [], currentId = null, currentMode = 'text';
let saveTimer = null, selectedTpl = 'libre';

/* ---------- Plantillas de tabla ---------- */
const TEMPLATES = {
  horario: {
    cols: ['Hora','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
    rows: [
      ['6:00'],['7:00'],['8:00'],['9:00'],['10:00'],['11:00'],['12:00'],
      ['13:00'],['14:00'],['15:00'],['16:00'],['17:00'],['18:00'],['19:00'],
      ['20:00'],['21:00'],['22:00']
    ]
  },
  rutina: {
    cols: ['Actividad','Hora','Duración','Días','Estado'],
    rows: [
      ['Despertarme','6:00','5 min','Lun-Dom','✅'],
      ['Ejercicio','6:30','45 min','Lun-Vie','✅'],
      ['Desayuno','7:30','20 min','Lun-Dom','✅'],
      ['Trabajo','8:00','8 hrs','Lun-Vie','⏳'],
      ['Lectura','21:00','30 min','Lun-Dom','⏳'],
      ['Dormir','22:30','8 hrs','Lun-Dom','✅']
    ]
  },
  comidas: {
    cols: ['Día','Desayuno','Media mañana','Comida','Merienda','Cena'],
    rows: [
      ['Lunes'],['Martes'],['Miércoles'],['Jueves'],
      ['Viernes'],['Sábado'],['Domingo']
    ]
  },
  tareas: {
    cols: ['Tarea','Descripción','Prioridad','Vence','Estado'],
    rows: [
      ['','','Alta','','Pendiente'],
      ['','','Media','','En progreso'],
      ['','','Baja','','Completada']
    ]
  },
  gastos: {
    cols: ['Fecha','Concepto','Categoría','Ingreso','Gasto','Balance'],
    rows: [
      ['','','Alimentación','','',''],
      ['','','Transporte','','',''],
      ['','','Servicios','','',''],
      ['','','Entretenimiento','','',''],
      ['TOTAL','','','','','']
    ]
  },
  libre: {
    cols: ['Columna 1','Columna 2','Columna 3'],
    rows: [['','',''],['','',''],['','','']]
  }
};

/* ============================================
   IndexedDB — apertura y operaciones CRUD
   ============================================ */
function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = e => { db = e.target.result; res(db); };
    req.onerror   = e => rej(e);
  });
}

function dbGetAll() {
  return new Promise((res, rej) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e);
  });
}

function dbPut(note) {
  return new Promise((res, rej) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(note);
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e);
  });
}

function dbDelete(id) {
  return new Promise((res, rej) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id);
    req.onsuccess = () => res();
    req.onerror   = e => rej(e);
  });
}

/* ============================================
   Utilidades
   ============================================ */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function escH(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ============================================
   Sidebar — lista de notas
   ============================================ */
function renderSidebar(filter = '') {
  const list = document.getElementById('notes-list');
  const q    = filter.toLowerCase();
  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(q) ||
    (n.content || '').toLowerCase().includes(q)
  );

  if (!filtered.length) {
    list.innerHTML = `
      <div class="empty-state" style="margin-top:2rem">
        <i class="ti ti-notes" aria-hidden="true"></i>
        <p>${filter ? 'Sin resultados' : 'Sin notas aún'}</p>
      </div>`;
    return;
  }

  list.innerHTML = filtered
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(n => {
      const isActive = n.id === currentId;
      const preview  = n.type === 'table'
        ? (n.tableData?.cols || []).join(', ')
        : (n.content || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 60);
      const date = new Date(n.updatedAt).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short'
      });
      return `
        <div class="note-item${isActive ? ' active' : ''}" data-id="${n.id}" role="button" tabindex="0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
            <div class="tag-badge ${n.type === 'table' ? 'tag-tabla' : 'tag-nota'}">
              ${n.type === 'table' ? 'Tabla' : 'Nota'}
            </div>
          </div>
          <div class="note-item-title">${n.title || 'Sin título'}</div>
          <div class="note-item-preview">${preview || 'Vacía'}</div>
          <div class="note-item-meta">
            <i class="ti ti-clock-hour-4" style="font-size:11px"></i>${date}
          </div>
        </div>`;
    }).join('');

  list.querySelectorAll('.note-item').forEach(el => {
    el.addEventListener('click',   () => openNote(el.dataset.id));
    el.addEventListener('keydown', e => { if (e.key === 'Enter') openNote(el.dataset.id); });
  });
}

/* ============================================
   Abrir y mostrar una nota
   ============================================ */
function openNote(id) {
  currentId = id;
  const note = notes.find(n => n.id === id);
  if (!note) return;

  document.getElementById('empty-main').style.display  = 'none';
  const ep = document.getElementById('editor-panel');
  ep.style.display = 'flex';

  document.getElementById('note-title').value  = note.title || '';
  document.getElementById('table-title').value = note.title || '';

  const date = new Date(note.updatedAt).toLocaleString('es-MX', {
    dateStyle: 'medium', timeStyle: 'short'
  });
  document.getElementById('note-date').textContent = 'Editado: ' + date;

  if (note.type === 'table') {
    setMode('table');
    renderTable(note.tableData || { cols: [], rows: [] });
    document.getElementById('word-count').textContent = '';
  } else {
    setMode('text');
    document.getElementById('content-editor').innerHTML = note.content || '';
    updateWordCount();
  }

  renderSidebar(document.getElementById('search-input').value);
}

/* ============================================
   Cambiar modo texto ↔ tabla
   ============================================ */
function setMode(m) {
  currentMode = m;
  document.querySelectorAll('.mode-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.mode === m)
  );
  document.getElementById('text-panel').style.display  = m === 'text'  ? 'block' : 'none';
  document.getElementById('table-panel').style.display = m === 'table' ? 'block' : 'none';
}

/* ============================================
   Tabla editable — render y eventos
   ============================================ */
function renderTable(data) {
  const thead = document.getElementById('table-head');
  const tbody = document.getElementById('table-body');
  const cols  = data.cols || [];
  const rows  = data.rows || [];

  thead.innerHTML = `<tr>
    ${cols.map((c, i) => `
      <th>
        <div class="col-header">
          <input class="cell-input" value="${escH(c)}" data-col="${i}" placeholder="Columna ${i + 1}">
          <button class="del-col" data-col="${i}" title="Eliminar columna">
            <i class="ti ti-x"></i>
          </button>
        </div>
      </th>`).join('')}
    <th class="row-actions"></th>
  </tr>`;

  tbody.innerHTML = rows.map((r, ri) => `
    <tr>
      ${cols.map((_, ci) => `
        <td>
          <input class="cell-input" value="${escH(r[ci] || '')}"
            data-row="${ri}" data-col="${ci}" placeholder="">
        </td>`).join('')}
      <td class="row-actions">
        <button class="del-row" data-row="${ri}" title="Eliminar fila">
          <i class="ti ti-x"></i>
        </button>
      </td>
    </tr>`).join('');

  bindTableEvents();
}

function getTableData() {
  const cols = Array.from(document.querySelectorAll('#table-head .cell-input'))
    .map(i => i.value);
  const rows = [];
  document.querySelectorAll('#table-body tr').forEach(tr => {
    rows.push(Array.from(tr.querySelectorAll('.cell-input')).map(i => i.value));
  });
  return { cols, rows };
}

function bindTableEvents() {
  /* Cabeceras */
  document.querySelectorAll('#table-head .cell-input').forEach(i =>
    i.addEventListener('input', scheduleSave)
  );

  /* Celdas de datos */
  document.querySelectorAll('#table-body .cell-input').forEach(i => {
    i.addEventListener('input', scheduleSave);
    i.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const all  = Array.from(document.querySelectorAll('#table-body .cell-input'));
        const next = all[all.indexOf(i) + 1];
        if (next) next.focus();
      }
    });
  });

  /* Eliminar fila */
  document.querySelectorAll('.del-row').forEach(b =>
    b.addEventListener('click', () => {
      const note = notes.find(n => n.id === currentId);
      if (!note) return;
      note.tableData.rows.splice(parseInt(b.dataset.row), 1);
      renderTable(note.tableData);
      scheduleSave();
    })
  );

  /* Eliminar columna */
  document.querySelectorAll('.del-col').forEach(b =>
    b.addEventListener('click', () => {
      const note = notes.find(n => n.id === currentId);
      if (!note) return;
      const ci = parseInt(b.dataset.col);
      note.tableData.cols.splice(ci, 1);
      note.tableData.rows = note.tableData.rows.map(r => { r.splice(ci, 1); return r; });
      renderTable(note.tableData);
      scheduleSave();
    })
  );
}

/* ============================================
   Guardado automático con debounce
   ============================================ */
function scheduleSave() {
  document.getElementById('save-dot').className    = 'dot saving';
  document.getElementById('save-status').textContent = 'Guardando...';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveCurrentNote, 800);
}

async function saveCurrentNote() {
  const note = notes.find(n => n.id === currentId);
  if (!note) return;

  if (currentMode === 'text') {
    note.title   = document.getElementById('note-title').value;
    note.content = document.getElementById('content-editor').innerHTML;
    updateWordCount();
  } else {
    note.title     = document.getElementById('table-title').value;
    note.tableData = getTableData();
  }

  note.updatedAt = Date.now();
  await dbPut(note);

  document.getElementById('save-dot').className      = 'dot';
  document.getElementById('save-status').textContent = 'Guardado';
  renderSidebar(document.getElementById('search-input').value);
}

function updateWordCount() {
  const text  = (document.getElementById('content-editor').innerText || '').trim();
  const words = text ? text.split(/\s+/).length : 0;
  document.getElementById('word-count').textContent = words + ' palabra' + (words !== 1 ? 's' : '');
}

/* ============================================
   Crear nueva nota
   ============================================ */
async function createNote(title, type, tableData) {
  const note = {
    id: uid(), title, type: type || 'text',
    content: '', tableData: tableData || null,
    createdAt: Date.now(), updatedAt: Date.now()
  };
  notes.push(note);
  await dbPut(note);
  renderSidebar();
  openNote(note.id);
}

/* ============================================
   Eventos de la interfaz
   ============================================ */

/* Botón "Nueva nota" */
document.getElementById('btn-new-note').addEventListener('click', () => {
  document.getElementById('new-note-title').value = '';
  document.getElementById('modal-new').classList.add('open');
  setTimeout(() => document.getElementById('new-note-title').focus(), 100);
});
document.getElementById('modal-cancel').addEventListener('click', () =>
  document.getElementById('modal-new').classList.remove('open')
);
document.getElementById('modal-create').addEventListener('click', async () => {
  const t = document.getElementById('new-note-title').value.trim() || 'Sin título';
  document.getElementById('modal-new').classList.remove('open');
  await createNote(t, 'text');
});
document.getElementById('new-note-title').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('modal-create').click();
});

/* Botón "Nueva tabla" */
document.getElementById('btn-new-table').addEventListener('click', () => {
  selectedTpl = 'libre';
  document.querySelectorAll('.template-card').forEach(c => c.style.borderColor = '');
  document.getElementById('table-note-title-input').value = '';
  document.getElementById('modal-table').classList.add('open');
});
document.getElementById('modal-table-cancel').addEventListener('click', () =>
  document.getElementById('modal-table').classList.remove('open')
);

/* Selección de plantilla */
document.querySelectorAll('.template-card').forEach(card => {
  card.addEventListener('click', () => {
    selectedTpl = card.dataset.tpl;
    document.querySelectorAll('.template-card').forEach(c => c.style.borderColor = '');
    card.style.borderColor = 'var(--accent)';
    const names = {
      horario: 'Mi horario semanal', rutina: 'Rutina diaria',
      comidas: 'Plan de comidas semanal', tareas: 'Lista de tareas',
      gastos: 'Registro de gastos', libre: 'Nueva tabla'
    };
    if (!document.getElementById('table-note-title-input').value)
      document.getElementById('table-note-title-input').value = names[selectedTpl] || '';
  });
});

document.getElementById('modal-table-create').addEventListener('click', async () => {
  const t   = document.getElementById('table-note-title-input').value.trim() || 'Nueva tabla';
  const tpl = TEMPLATES[selectedTpl] || TEMPLATES.libre;
  document.getElementById('modal-table').classList.remove('open');
  await createNote(t, 'table', JSON.parse(JSON.stringify(tpl)));
});

/* Estado vacío → crear nota */
document.getElementById('btn-start').addEventListener('click', () =>
  document.getElementById('btn-new-note').click()
);

/* Eliminar nota */
document.getElementById('btn-delete-note').addEventListener('click', async () => {
  if (!currentId) return;
  if (!confirm('¿Eliminar esta nota?')) return;
  await dbDelete(currentId);
  notes = notes.filter(n => n.id !== currentId);
  currentId = null;
  document.getElementById('editor-panel').style.display = 'none';
  document.getElementById('empty-main').style.display   = 'flex';
  renderSidebar();
});

/* Tabs de modo */
document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    if (!currentId) return;
    setMode(tab.dataset.mode);
  });
});

/* Toolbar de formato */
document.querySelectorAll('.toolbar-btn').forEach(btn => {
  btn.addEventListener('mousedown', e => {
    e.preventDefault();
    document.execCommand(btn.dataset.cmd, false, btn.dataset.val || null);
    document.getElementById('content-editor').focus();
  });
});

/* Guardado en editor de texto */
document.getElementById('content-editor').addEventListener('input', scheduleSave);
document.getElementById('note-title').addEventListener('input', scheduleSave);
document.getElementById('table-title').addEventListener('input', scheduleSave);

/* Agregar filas */
document.getElementById('btn-add-rows').addEventListener('click', () => {
  const note = notes.find(n => n.id === currentId);
  if (!note) return;
  const n    = parseInt(document.getElementById('add-rows').value) || 1;
  const cols = note.tableData.cols.length || 3;
  for (let i = 0; i < n; i++) note.tableData.rows.push(Array(cols).fill(''));
  renderTable(note.tableData);
  scheduleSave();
});

/* Agregar columnas */
document.getElementById('btn-add-cols').addEventListener('click', () => {
  const note = notes.find(n => n.id === currentId);
  if (!note) return;
  const n = parseInt(document.getElementById('add-cols').value) || 1;
  for (let i = 0; i < n; i++) {
    note.tableData.cols.push(`Columna ${note.tableData.cols.length + 1}`);
    note.tableData.rows.forEach(r => r.push(''));
  }
  renderTable(note.tableData);
  scheduleSave();
});

/* Búsqueda en tiempo real */
document.getElementById('search-input').addEventListener('input', e =>
  renderSidebar(e.target.value)
);

/* Cerrar modales al hacer clic en el fondo */
document.querySelectorAll('.modal-bg').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

/* ============================================
   Inicio — abrir IndexedDB y cargar notas
   ============================================ */
(async () => {
  await openDB();
  notes = await dbGetAll();
  renderSidebar();
  if (notes.length > 0) {
    const last = notes.sort((a, b) => b.updatedAt - a.updatedAt)[0];
    openNote(last.id);
  }
})();
</script>
</body>
</html>
