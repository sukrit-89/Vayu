
(async function tapNodeShims(projectRoot) {
    // ... existing code ...
    // PATCH: Windows fix for node:sea
    if (shimDir.includes('node:')) return;

    await _fs.default.promises.mkdir(shimDir, { recursive: true });
    // ... existing code ...
})();
