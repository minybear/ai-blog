'use strict';

(() => {
  const contactDialog = document.getElementById('contact-dialog');
  const toolDialog = document.getElementById('tool-dialog');
  const toolFrame = document.getElementById('tool-frame');
  const toolTitle = document.getElementById('tool-dialog-title');
  const externalTool = document.getElementById('external-tool');
  const topic = document.getElementById('contact-topic');
  const copyEmail = document.querySelector('[data-copy-email]');
  const copyStatus = document.getElementById('copy-status');
  const copyOfficial = document.querySelector('[data-copy-official]');
  const officialCopyStatus = document.getElementById('official-copy-status');
  const toolLinks = [...document.querySelectorAll('[data-tool]')];
  const dialogTriggers = new WeakMap();
  let previousHash = '';

  if (!contactDialog || !toolDialog) return;

  const canModal = typeof contactDialog.showModal === 'function';

  function syncBodyLock() {
    if (!contactDialog.open && !toolDialog.open) document.body.classList.remove('is-locked');
  }

  function openDialog(dialog, trigger) {
    dialogTriggers.set(dialog, trigger || document.activeElement);
    if (canModal) {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.body.classList.add('is-locked');
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
      dialog.dispatchEvent(new Event('close'));
    }
    syncBodyLock();
  }

  function openContact(trigger) {
    const direction = trigger?.dataset.contact || '需求沟通';
    topic.textContent = `咨询方向：${direction}`;
    if (copyStatus) copyStatus.textContent = '';
    openDialog(contactDialog, trigger);
  }

  document.querySelectorAll('[data-contact]').forEach((trigger) => {
    trigger.addEventListener('click', () => openContact(trigger));
  });

  contactDialog.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => closeDialog(contactDialog));
  });

  contactDialog.addEventListener('click', (event) => {
    if (event.target === contactDialog) closeDialog(contactDialog);
  });

  if (copyEmail) {
    copyEmail.addEventListener('click', async () => {
      const email = copyEmail.dataset.copyEmail;
      try {
        await navigator.clipboard.writeText(email);
        if (copyStatus) copyStatus.textContent = '邮箱已复制，可以粘贴到邮件客户端。';
      } catch {
        if (copyStatus) copyStatus.textContent = '复制不可用，请直接点击邮箱地址发送邮件。';
      }
    });
  }

  if (copyOfficial) {
    copyOfficial.addEventListener('click', async () => {
      const name = copyOfficial.dataset.copyOfficial;
      try {
        await navigator.clipboard.writeText(name);
        if (officialCopyStatus) officialCopyStatus.textContent = '公众号名已复制。';
      } catch {
        if (officialCopyStatus) officialCopyStatus.textContent = '复制不可用，请手动搜索公众号名。';
      }
    });
  }

  function openTool(link) {
    previousHash = location.hash;
    const title = link.dataset.toolTitle || link.querySelector('h3')?.textContent || '免费工具';
    toolTitle.textContent = title;
    externalTool.href = link.href;
    toolFrame.title = title;
    toolFrame.src = link.href;
    history.replaceState(null, '', `${location.pathname}${location.search}#${link.dataset.tool}`);
    openDialog(toolDialog, link);
  }

  toolLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      openTool(link);
    });
  });

  document.querySelectorAll('[data-close-tool]').forEach((button) => {
    button.addEventListener('click', () => closeDialog(toolDialog));
  });

  toolDialog.addEventListener('close', () => {
    toolFrame.src = 'about:blank';
    const restoredHash = toolLinks.some((link) => `#${link.dataset.tool}` === previousHash) ? '#tools' : previousHash;
    history.replaceState(null, '', `${location.pathname}${location.search}${restoredHash}`);
  });

  [contactDialog, toolDialog].forEach((dialog) => {
    dialog.addEventListener('close', () => {
      syncBodyLock();
      const trigger = dialogTriggers.get(dialog);
      if (trigger && typeof trigger.focus === 'function') trigger.focus({ preventScroll: true });
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !canModal) {
      if (contactDialog.hasAttribute('open')) closeDialog(contactDialog);
      if (toolDialog.hasAttribute('open')) closeDialog(toolDialog);
    }
  });

  const initialTool = toolLinks.find((link) => `#${link.dataset.tool}` === location.hash);
  if (initialTool) openTool(initialTool);
})();
