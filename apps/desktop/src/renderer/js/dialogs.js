/**
 * Land Survey CAD - Dialogs & User Feedback Engine
 * Non-blocking toasts, confirmation modals, and prompt dialogs
 */

(function(global) {
  'use strict';

  const Dialogs = {
    showToast: function(message, type = 'info') {
      let toast = document.getElementById('cadToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cadToast';
        document.body.appendChild(toast);
      }
      const bgClass = type === 'success' ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/50 shadow-emerald-950/40' :
                      type === 'warning' ? 'bg-amber-950/95 text-amber-200 border-amber-500/50 shadow-amber-950/40' :
                      type === 'error'   ? 'bg-rose-950/95 text-rose-200 border-rose-500/50 shadow-rose-950/40' :
                                           'bg-slate-900/95 text-sky-200 border-sky-500/40 shadow-slate-950/40';
      toast.className = `fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 pointer-events-none text-xs font-semibold border ${bgClass}`;
      const dotColor = type === 'success' ? 'bg-emerald-400' : type === 'error' ? 'bg-rose-400' : type === 'warning' ? 'bg-amber-400' : 'bg-sky-400';
      toast.innerHTML = `<span class="w-2.5 h-2.5 rounded-full ${dotColor} animate-pulse flex-shrink-0"></span><span>${message}</span>`;

      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      });

      clearTimeout(toast._timer);
      toast._timer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-12px)';
      }, 4000);
    },

    showConfirmDialog: function(title, message, onConfirm) {
      let modal = document.getElementById('cadConfirmModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cadConfirmModal';
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden';
        modal.innerHTML = `
          <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div class="flex items-center gap-2 text-rose-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <h3 id="cadConfirmTitle" class="text-base font-extrabold text-white"></h3>
            </div>
            <p id="cadConfirmMessage" class="text-xs text-slate-300 leading-relaxed"></p>
            <div class="flex justify-end gap-2.5 pt-2">
              <button id="btnCadConfirmCancel" type="button" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors">বাতিল</button>
              <button id="btnCadConfirmOk" type="button" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer transition-colors">নিশ্চিত করুন</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btnCadConfirmCancel').addEventListener('click', () => {
          modal.classList.add('hidden');
        });
      }
      document.getElementById('cadConfirmTitle').textContent = title;
      document.getElementById('cadConfirmMessage').textContent = message;
      const okBtn = document.getElementById('btnCadConfirmOk');
      const newOkBtn = okBtn.cloneNode(true);
      okBtn.parentNode.replaceChild(newOkBtn, okBtn);
      newOkBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (onConfirm) onConfirm();
      });
      modal.classList.remove('hidden');
    },

    showPromptDialog: function(title, placeholder, defaultValue, onConfirm) {
      let modal = document.getElementById('cadPromptModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cadPromptModal';
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden';
        modal.innerHTML = `
          <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 id="cadPromptTitle" class="text-base font-extrabold text-white"></h3>
            <input type="text" id="cadPromptInput" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-medium">
            <div class="flex justify-end gap-2.5 pt-2">
              <button id="btnCadPromptCancel" type="button" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors">বাতিল</button>
              <button id="btnCadPromptOk" type="button" class="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 cursor-pointer transition-colors">সংরক্ষণ করুন</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btnCadPromptCancel').addEventListener('click', () => {
          modal.classList.add('hidden');
        });
      }
      document.getElementById('cadPromptTitle').textContent = title;
      const input = document.getElementById('cadPromptInput');
      input.placeholder = placeholder || '';
      input.value = defaultValue || '';
      const okBtn = document.getElementById('btnCadPromptOk');
      const newOkBtn = okBtn.cloneNode(true);
      okBtn.parentNode.replaceChild(newOkBtn, okBtn);
      newOkBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (onConfirm) onConfirm(input.value);
      });
      modal.classList.remove('hidden');
      setTimeout(() => input.focus(), 60);
    }
  };

  global.LSCAD = global.LSCAD || {};
  global.LSCAD.Dialogs = Dialogs;

})(typeof window !== 'undefined' ? window : this);
