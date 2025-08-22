document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const imageUpload = document.getElementById('image-upload');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const originalSize = document.getElementById('original-size');
    const fileSize = document.getElementById('file-size');
    const editContainer = document.getElementById('edit-container');
    const resultContainer = document.getElementById('result-container');
    const resultImage = document.getElementById('result-image');
    const newSize = document.getElementById('new-size');
    const newFileSize = document.getElementById('new-file-size');
    const sizeWarning = document.getElementById('size-warning');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const processBtn = document.getElementById('process-btn');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    
    // 抠图功能相关DOM元素
    const removeBgCheckbox = document.getElementById('remove-bg');
    const removeBgSettings = document.getElementById('remove-bg-settings');
    const thresholdSlider = document.getElementById('threshold-slider');
    const thresholdValue = document.getElementById('threshold-value');
    
    // 批量处理相关DOM元素
    const modeBtns = document.querySelectorAll('.mode-btn');
    const singleUpload = document.getElementById('single-upload');
    const batchUpload = document.getElementById('batch-upload');
    const batchImageUpload = document.getElementById('batch-image-upload');
    const batchPreviewContainer = document.getElementById('batch-preview-container');
    const batchPreviewList = document.getElementById('batch-preview-list');
    const batchCount = document.getElementById('batch-count');
    const batchResultContainer = document.getElementById('batch-result-container');
    const batchProgressFill = document.getElementById('batch-progress-fill');
    const batchProgressText = document.getElementById('batch-progress-text');
    const batchImagesGrid = document.getElementById('batch-images-grid');
    const batchDownloadBtn = document.getElementById('batch-download-btn');
    const batchResetBtn = document.getElementById('batch-reset-btn');
    
    // 图片分割相关DOM元素
    const splitUpload = document.getElementById('split-upload');
    const splitImageUpload = document.getElementById('split-image-upload');
    const splitContainer = document.getElementById('split-container');
    const splitResultContainer = document.getElementById('split-result-container');
    const splitBtn = document.getElementById('split-btn');
    const splitResetBtn = document.getElementById('split-reset-btn');
    const splitDownloadAllBtn = document.getElementById('split-download-all-btn');
    const splitImagesGrid = document.getElementById('split-images-grid');
    const splitQualitySlider = document.getElementById('split-quality');
    const splitQualityValue = document.getElementById('split-quality-value');
    
    // 分割选项相关DOM元素
    const splitModeRadios = document.querySelectorAll('input[name="split-mode"]');
    const gridSplitOptions = document.getElementById('grid-split-options');
    const customSplitOptions = document.getElementById('custom-split-options');
    const splitRowsInput = document.getElementById('split-rows');
    const splitColsInput = document.getElementById('split-cols');
    const splitCountInput = document.getElementById('split-count');
    const splitLayoutSelect = document.getElementById('split-layout');
    const splitSizeSelect = document.getElementById('split-size');
    const splitFormatRadios = document.querySelectorAll('input[name="split-format"]');
    
    // 分割结果信息元素
    const splitOriginalSize = document.getElementById('split-original-size');
    const splitMethod = document.getElementById('split-method');
    const splitTotalCount = document.getElementById('split-total-count');

    // 全局变量
    let originalFile = null;
    let originalImageWidth = 0;
    let originalImageHeight = 0;
    
    // 批量处理全局变量
    let currentMode = 'single'; // 'single'、'batch' 或 'split'
    let batchFiles = [];
    let batchResults = [];
    let isProcessingBatch = false;
    
    // 图片分割全局变量
    let splitFile = null;
    let splitImage = null;
    let splitResults = [];
    let isProcessingSplit = false;

    // 更新质量百分比显示
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = qualitySlider.value + '%';
    });
    
    // 更新抠图灵敏度百分比显示
    thresholdSlider.addEventListener('input', () => {
        thresholdValue.textContent = thresholdSlider.value + '%';
    });
    
    // 更新分割质量百分比显示
    splitQualitySlider.addEventListener('input', () => {
        splitQualityValue.textContent = splitQualitySlider.value + '%';
    });
    
    // 确保初始显示值正确
    thresholdValue.textContent = thresholdSlider.value + '%';
    
    // 切换抠图设置的显示/隐藏
    removeBgCheckbox.addEventListener('change', () => {
        if (removeBgCheckbox.checked) {
            removeBgSettings.classList.remove('hidden');
        } else {
            removeBgSettings.classList.add('hidden');
        }
    });
    
    // 模式切换功能
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            switchMode(mode);
        });
    });
    
    // 切换处理模式
    function switchMode(mode) {
        currentMode = mode;
        
        // 更新按钮状态
        modeBtns.forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // 切换上传界面
        if (mode === 'single') {
            singleUpload.classList.remove('hidden');
            batchUpload.classList.add('hidden');
            splitUpload.classList.add('hidden');
            batchPreviewContainer.classList.add('hidden');
            batchResultContainer.classList.add('hidden');
            splitContainer.classList.add('hidden');
            splitResultContainer.classList.add('hidden');
            resetSingleMode();
        } else if (mode === 'batch') {
            singleUpload.classList.add('hidden');
            batchUpload.classList.remove('hidden');
            splitUpload.classList.add('hidden');
            previewContainer.classList.add('hidden');
            editContainer.classList.add('hidden');
            resultContainer.classList.add('hidden');
            splitContainer.classList.add('hidden');
            splitResultContainer.classList.add('hidden');
            resetBatchMode();
        } else if (mode === 'split') {
            singleUpload.classList.add('hidden');
            batchUpload.classList.add('hidden');
            splitUpload.classList.remove('hidden');
            previewContainer.classList.add('hidden');
            editContainer.classList.add('hidden');
            resultContainer.classList.add('hidden');
            batchPreviewContainer.classList.add('hidden');
            batchResultContainer.classList.add('hidden');
            resetSplitMode();
        }
    }
    
    // 重置单张模式
    function resetSingleMode() {
        imageUpload.value = '';
        previewContainer.classList.add('hidden');
        editContainer.classList.add('hidden');
        resultContainer.classList.add('hidden');
        sizeWarning.classList.add('hidden');
        previewImage.src = '';
        resultImage.src = '';
        originalFile = null;
        originalImageWidth = 0;
        originalImageHeight = 0;
    }
    
    // 重置批量模式
    function resetBatchMode() {
        batchImageUpload.value = '';
        batchPreviewContainer.classList.add('hidden');
        batchResultContainer.classList.add('hidden');
        batchFiles = [];
        batchResults = [];
        batchPreviewList.innerHTML = '';
        batchImagesGrid.innerHTML = '';
        batchProgressFill.style.width = '0%';
        batchProgressText.textContent = '0/0';
    }
    
    // 重置分割模式
    function resetSplitMode() {
        splitImageUpload.value = '';
        splitContainer.classList.add('hidden');
        splitResultContainer.classList.add('hidden');
        splitFile = null;
        splitImage = null;
        splitResults = [];
        splitImagesGrid.innerHTML = '';
    }

    // 处理图片上传
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // 验证文件是否为图片
        if (!file.type.match('image.*')) {
            alert('请上传图片文件！');
            return;
        }

        originalFile = file;
        
        // 显示预览和原始信息
        const reader = new FileReader();
        reader.onload = (e) => {
            // 创建图片对象以获取原始尺寸
            const img = new Image();
            img.onload = () => {
                originalImageWidth = img.width;
                originalImageHeight = img.height;
                
                // 更新UI
                originalSize.textContent = `${img.width} x ${img.height}`;
                fileSize.textContent = formatFileSize(file.size);
                
                // 显示预览和编辑区域
                previewContainer.classList.remove('hidden');
                editContainer.classList.remove('hidden');
            };
            img.src = e.target.result;
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    // 批量图片上传处理
    batchImageUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        // 验证所有文件都是图片
        const invalidFiles = files.filter(file => !file.type.match('image.*'));
        if (invalidFiles.length > 0) {
            alert('只能上传图片文件！');
            return;
        }
        
        batchFiles = files;
        displayBatchPreview();
    });
    
    // 分割模式切换事件
    splitModeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'grid') {
                gridSplitOptions.classList.remove('hidden');
                customSplitOptions.classList.add('hidden');
            } else {
                gridSplitOptions.classList.add('hidden');
                customSplitOptions.classList.remove('hidden');
            }
        });
    });
    
    // 分割图片上传处理
    splitImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // 验证文件是否为图片
        if (!file.type.match('image.*')) {
            alert('请上传图片文件！');
            return;
        }
        
        splitFile = file;
        
        // 读取图片并显示分割设置
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                splitImage = img;
                
                // 更新原图尺寸信息
                splitOriginalSize.textContent = `${img.width} x ${img.height}`;
                
                // 显示分割设置区域
                splitContainer.classList.remove('hidden');
                
                // 根据图片尺寸智能建议分割参数
                suggestSplitParameters(img.width, img.height);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    // 显示批量预览
    function displayBatchPreview() {
        batchPreviewList.innerHTML = '';
        batchCount.textContent = batchFiles.length;
        
        batchFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = createBatchPreviewItem(file, e.target.result, index);
                batchPreviewList.appendChild(previewItem);
                
                // 当所有图片都加载完成后显示预览区域
                if (batchPreviewList.children.length === batchFiles.length) {
                    batchPreviewContainer.classList.remove('hidden');
                    editContainer.classList.remove('hidden');
                }
            };
            reader.readAsDataURL(file);
        });
    }
    
    // 创建批量预览项
    function createBatchPreviewItem(file, imageSrc, index) {
        const div = document.createElement('div');
        div.className = 'batch-preview-item';
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = `预览图 ${index + 1}`;
        
        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('div');
        fileSize.className = 'file-size';
        fileSize.textContent = formatFileSize(file.size);
        
        div.appendChild(img);
        div.appendChild(fileName);
        div.appendChild(fileSize);
        
        return div;
    }

    // 处理图片按钮点击事件
    processBtn.addEventListener('click', () => {
        if (currentMode === 'single') {
            if (!originalFile) return;
            
            const selectedSize = document.querySelector('input[name="size-option"]:checked').value;
            const quality = parseInt(qualitySlider.value) / 100;
            const removeBg = removeBgCheckbox.checked;
            const threshold = parseInt(thresholdSlider.value) / 100;
            
            // 检查是否需要去除背景
            if (removeBg) {
                if (selectedSize === '750-400') {
                    resizeAndRemoveBgRectangle(originalFile, 750, 400, quality, threshold);
                } else {
                    resizeAndRemoveBg(originalFile, parseInt(selectedSize), quality, threshold);
                }
            } else {
                // 原有的图片处理逻辑
                if (selectedSize === '750-400') {
                    resizeImageToRectangle(originalFile, 750, 400, quality);
                } else {
                    resizeImage(originalFile, parseInt(selectedSize), quality);
                }
            }
        } else {
            // 批量处理模式
            if (batchFiles.length === 0) return;
            
            const selectedSize = document.querySelector('input[name="size-option"]:checked').value;
            const quality = parseInt(qualitySlider.value) / 100;
            const removeBg = removeBgCheckbox.checked;
            const threshold = parseInt(thresholdSlider.value) / 100;
            
            processBatchImages(selectedSize, quality, removeBg, threshold);
        }
    });

    // 重置按钮点击事件
    resetBtn.addEventListener('click', () => {
        // 重置表单和UI
        imageUpload.value = '';
        previewContainer.classList.add('hidden');
        editContainer.classList.add('hidden');
        resultContainer.classList.add('hidden');
        sizeWarning.classList.add('hidden');
        
        // 重置质量信息显示
        const qualityInfo = document.querySelector('.quality-info');
        if (qualityInfo) {
            qualityInfo.style.display = 'none';
        }
        
        // 重置大尺寸图片信息显示
        const largeImageInfo = document.querySelector('.large-image-info');
        if (largeImageInfo) {
            largeImageInfo.style.display = 'none';
        }
        
        // 重置矩形图片信息显示
        const rectangleImageInfo = document.querySelector('.rectangle-image-info');
        if (rectangleImageInfo) {
            rectangleImageInfo.style.display = 'none';
        }
        
        // 重置预览图片
        previewImage.src = '';
        resultImage.src = '';
        
        // 重置全局变量
        originalFile = null;
        originalImageWidth = 0;
        originalImageHeight = 0;
    });
    
    // 批量重置按钮事件
    batchResetBtn.addEventListener('click', () => {
        resetBatchMode();
        batchPreviewContainer.classList.add('hidden');
        editContainer.classList.add('hidden');
    });
    
    // 批量处理图片
    async function processBatchImages(selectedSize, quality, removeBg, threshold) {
        if (isProcessingBatch) return;
        
        isProcessingBatch = true;
        batchResults = [];
        
        // 显示批量处理结果区域
        batchResultContainer.classList.remove('hidden');
        batchImagesGrid.innerHTML = '';
        
        // 设置进度条
        updateBatchProgress(0, batchFiles.length);
        
        // 逐个处理图片
        for (let i = 0; i < batchFiles.length; i++) {
            const file = batchFiles[i];
            
            try {
                const result = await processSingleImageInBatch(file, selectedSize, quality, removeBg, threshold, i);
                batchResults.push(result);
                
                // 显示处理结果
                displayBatchResultItem(result, i);
                
                // 更新进度
                updateBatchProgress(i + 1, batchFiles.length);
                
            } catch (error) {
                console.error(`处理图片 ${file.name} 时出错:`, error);
                
                // 显示错误结果
                const errorResult = {
                    file: file,
                    success: false,
                    error: error.message
                };
                batchResults.push(errorResult);
                displayBatchResultItem(errorResult, i);
                
                updateBatchProgress(i + 1, batchFiles.length);
            }
        }
        
        isProcessingBatch = false;
        
        // 处理完成后显示下载按钮
        if (batchResults.length > 0) {
            batchDownloadBtn.style.display = 'inline-block';
        }
    }
    
    // 在批量处理中处理单个图片
    function processSingleImageInBatch(file, selectedSize, quality, removeBg, threshold, index) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        let processFunction;
                        
                        if (removeBg) {
                            if (selectedSize === '750-400') {
                                processFunction = resizeAndRemoveBgRectangleForBatch;
                            } else {
                                processFunction = resizeAndRemoveBgForBatch;
                            }
                        } else {
                            if (selectedSize === '750-400') {
                                processFunction = resizeImageToRectangleForBatch;
                            } else {
                                processFunction = resizeImageForBatch;
                            }
                        }
                        
                        processFunction(file, img, selectedSize, quality, threshold)
                            .then(result => resolve(result))
                            .catch(error => reject(error));
                            
                    } catch (error) {
                        reject(error);
                    }
                };
                img.onerror = () => reject(new Error('图片加载失败'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsDataURL(file);
        });
    }
    
    // 批量处理专用的图片调整函数
    function resizeImageForBatch(file, img, targetSize, quality) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetSize, targetSize);
            
            // 计算裁剪方式（正方形裁剪）
            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = img.width;
            let sourceHeight = img.height;
            
            if (img.width > img.height) {
                sourceX = (img.width - img.height) / 2;
                sourceWidth = img.height;
            } else if (img.height > img.width) {
                sourceY = (img.height - img.width) / 2;
                sourceHeight = img.width;
            }
            
            ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetSize, targetSize);
            
            // 简化处理，直接使用指定质量
            canvas.toBlob((blob) => {
                resolve({
                    file: file,
                    blob: blob,
                    success: true,
                    size: `${targetSize}x${targetSize}`,
                    fileSize: blob.size,
                    format: 'image/jpeg'
                });
            }, 'image/jpeg', quality);
        });
    }
    
    // 批量处理专用的矩形图片调整函数
    function resizeImageToRectangleForBatch(file, img, width, height, quality) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            
            // 计算宽高比
            const targetRatio = width / height;
            const sourceRatio = img.width / img.height;
            
            let sourceX = 0;
            let sourceY = 0;
            let usedSourceWidth = img.width;
            let usedSourceHeight = img.height;
            
            if (sourceRatio > targetRatio) {
                usedSourceWidth = img.height * targetRatio;
                sourceX = (img.width - usedSourceWidth) / 2;
            } else if (sourceRatio < targetRatio) {
                usedSourceHeight = img.width / targetRatio;
                sourceY = (img.height - usedSourceHeight) / 2;
            }
            
            ctx.drawImage(img, sourceX, sourceY, usedSourceWidth, usedSourceHeight, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                resolve({
                    file: file,
                    blob: blob,
                    success: true,
                    size: `${width}x${height}`,
                    fileSize: blob.size,
                    format: 'image/jpeg'
                });
            }, 'image/jpeg', quality);
        });
    }
    
    // 批量处理专用的抠图函数
    function resizeAndRemoveBgForBatch(file, img, targetSize, quality, threshold) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, targetSize, targetSize);
            
            // 计算裁剪方式
            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = img.width;
            let sourceHeight = img.height;
            
            if (img.width > img.height) {
                sourceX = (img.width - img.height) / 2;
                sourceWidth = img.height;
            } else if (img.height > img.width) {
                sourceY = (img.height - img.width) / 2;
                sourceHeight = img.width;
            }
            
            // 创建临时canvas进行抠图
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = sourceWidth;
            tempCanvas.height = sourceHeight;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
            
            const imageData = tempCtx.getImageData(0, 0, sourceWidth, sourceHeight);
            removeBackground(imageData, threshold);
            tempCtx.putImageData(imageData, 0, 0);
            
            ctx.drawImage(tempCanvas, 0, 0, targetSize, targetSize);
            
            canvas.toBlob((blob) => {
                resolve({
                    file: file,
                    blob: blob,
                    success: true,
                    size: `${targetSize}x${targetSize}`,
                    fileSize: blob.size,
                    format: 'image/png',
                    backgroundRemoved: true
                });
            }, 'image/png', 1.0);
        });
    }
    
    // 批量处理专用的矩形抠图函数
    function resizeAndRemoveBgRectangleForBatch(file, img, width, height, quality, threshold) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, width, height);
            
            // 计算缩放比例
            let scaleFactor = Math.min(width / img.width, height / img.height);
            let scaledWidth = img.width * scaleFactor;
            let scaledHeight = img.height * scaleFactor;
            let x = (width - scaledWidth) / 2;
            let y = (height - scaledHeight) / 2;
            
            // 创建临时canvas进行抠图
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);
            
            const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
            removeBackground(imageData, threshold);
            tempCtx.putImageData(imageData, 0, 0);
            
            ctx.drawImage(tempCanvas, 0, 0, img.width, img.height, x, y, scaledWidth, scaledHeight);
            
            canvas.toBlob((blob) => {
                resolve({
                    file: file,
                    blob: blob,
                    success: true,
                    size: `${width}x${height}`,
                    fileSize: blob.size,
                    format: 'image/png',
                    backgroundRemoved: true
                });
            }, 'image/png', 1.0);
        });
    }
    
    // 更新批量处理进度
    function updateBatchProgress(current, total) {
        const percentage = (current / total) * 100;
        batchProgressFill.style.width = percentage + '%';
        batchProgressText.textContent = `${current}/${total}`;
    }
    
    // 显示批量处理结果项
    function displayBatchResultItem(result, index) {
        const div = document.createElement('div');
        div.className = 'batch-result-item';
        
        if (result.success) {
            const imageUrl = URL.createObjectURL(result.blob);
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = `处理后图片 ${index + 1}`;
            
            const info = document.createElement('div');
            info.className = 'result-info';
            info.innerHTML = `
                <div title="${result.file.name}">${truncateFileName(result.file.name)}</div>
                <div>尺寸: ${result.size}</div>
                <div>大小: ${formatFileSize(result.fileSize)}</div>
                <div>格式: ${result.format === 'image/png' ? 'PNG' : 'JPEG'}${result.backgroundRemoved ? ' (透明背景)' : ''}</div>
            `;
            
            const downloadLink = document.createElement('a');
            downloadLink.className = 'download-single';
            downloadLink.href = imageUrl;
            downloadLink.textContent = '下载';
            downloadLink.download = getBatchFileName(result.file, result.size, result.format, result.backgroundRemoved);
            
            div.appendChild(img);
            div.appendChild(info);
            div.appendChild(downloadLink);
        } else {
            div.innerHTML = `
                <div style="color: #e74c3c; text-align: center; padding: 20px;">
                    <div>❌ 处理失败</div>
                    <div style="font-size: 0.8rem; margin-top: 10px;" title="${result.file.name}">${truncateFileName(result.file.name)}</div>
                    <div style="font-size: 0.7rem; color: #666;">${result.error}</div>
                </div>
            `;
        }
        
        batchImagesGrid.appendChild(div);
    }
    
    // 截断过长的文件名
    function truncateFileName(fileName, maxLength = 20) {
        if (fileName.length <= maxLength) return fileName;
        const extension = fileName.split('.').pop();
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3);
        return `${truncatedName}...${extension}`;
    }
    
    // 获取批量处理的文件名
    function getBatchFileName(originalFile, size, format, backgroundRemoved) {
        const nameWithoutExt = originalFile.name.replace(/\.[^/.]+$/, '');
        const extension = format === 'image/png' ? 'png' : 'jpg';
        const bgSuffix = backgroundRemoved ? '-transparent' : '';
        return `${nameWithoutExt}_${size}${bgSuffix}.${extension}`;
    }

    // 调整图片尺寸函数
    function resizeImage(file, targetSize, initialQuality) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 创建canvas进行图片处理
                const canvas = document.createElement('canvas');
                canvas.width = targetSize;
                canvas.height = targetSize;
                
                // 绘制图片
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, targetSize, targetSize);
                
                // 计算裁剪方式（正方形裁剪）
                let sourceX = 0;
                let sourceY = 0;
                let sourceWidth = img.width;
                let sourceHeight = img.height;
                
                if (img.width > img.height) {
                    sourceX = (img.width - img.height) / 2;
                    sourceWidth = img.height;
                } else if (img.height > img.width) {
                    sourceY = (img.height - img.width) / 2;
                    sourceHeight = img.width;
                }
                
                // 绘制并裁剪图片为正方形
                ctx.drawImage(
                    img,
                    sourceX, sourceY, sourceWidth, sourceHeight,
                    0, 0, targetSize, targetSize
                );
                
                // 根据图片尺寸选择合适的处理方式
                if (targetSize <= 50) {
                    // 对于非常小的图片，使用PNG以保持最佳质量
                    processSmallImage(canvas, targetSize);
                } else if (targetSize >= 640) {
                    // 对于大尺寸图片(640×640)，使用更低的初始质量以避免文件过大
                    processLargeImage(canvas, initialQuality, targetSize);
                } else {
                    // 对于中等尺寸图片使用常规处理
                    tryOptimalFormat(canvas, initialQuality, targetSize);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 处理小尺寸图片的专用函数
    function processSmallImage(canvas, targetSize) {
        console.log("处理小尺寸图片，使用高质量设置");
        
        // 首先尝试PNG格式（无损）
        canvas.toBlob((pngBlob) => {
            console.log(`小图片 PNG格式大小: ${formatFileSize(pngBlob.size)}`);
            
            // 如果PNG格式太大，尝试高质量的JPEG
            if (pngBlob.size > 30 * 1024) { // 如果PNG超过30KB
                // 尝试高质量JPEG
                createHighQualityJpeg(canvas, targetSize);
            } else {
                // PNG格式合适，使用PNG
                handleProcessedImage(pngBlob, targetSize, 1.0, false, 'image/png');
            }
        }, 'image/png');
    }
    
    // 创建高质量JPEG图片
    function createHighQualityJpeg(canvas, targetSize) {
        // 对于小图片，我们使用更高的起始质量
        const quality = 0.95; // 使用95%的质量
        
        canvas.toBlob((blob) => {
            console.log(`小图片 JPEG(高质量)大小: ${formatFileSize(blob.size)}`);
            
            // 确保文件大小不会太小
            if (blob.size < 15 * 1024) { // 如果小于15KB
                // 尝试使用更高质量的设置或其他格式
                console.log("JPEG文件太小，使用更高质量");
                increaseSizeForSmallImage(canvas, targetSize, blob);
            } else {
                // 使用这个JPEG
                handleProcessedImage(blob, targetSize, 0.95, false, 'image/jpeg');
            }
        }, 'image/jpeg', quality);
    }
    
    // 对于太小的图片尝试增加文件大小的方法
    function increaseSizeForSmallImage(canvas, targetSize, originalBlob) {
        // 尝试使用WebP格式，通常对于小图片会产生更大的文件大小
        if (typeof canvas.toBlob === 'function') {
            try {
                canvas.toBlob((webpBlob) => {
                    console.log(`WebP格式大小: ${formatFileSize(webpBlob.size)}`);
                    
                    // 比较WebP和其他格式的大小，选择最合适的
                    if (webpBlob && webpBlob.size > originalBlob.size) {
                        handleProcessedImage(webpBlob, targetSize, 1.0, false, 'image/webp');
                    } else {
                        // 回退到原始blob
                        handleProcessedImage(originalBlob, targetSize, 0.95, false, 'image/jpeg');
                    }
                }, 'image/webp', 0.99);
                return;
            } catch (e) {
                console.log("WebP格式不支持，继续使用其他格式");
            }
        }
        
        // 如果WebP不支持或者失败，我们尝试使用Base64编码扩充数据
        enhanceImageQuality(canvas, targetSize, originalBlob);
    }
    
    // 通过额外处理增强图片质量
    function enhanceImageQuality(canvas, targetSize, originalBlob) {
        // 创建一个新的、更大的canvas以提高质量
        const enhancedCanvas = document.createElement('canvas');
        const scale = 2; // 放大2倍
        enhancedCanvas.width = targetSize * scale;
        enhancedCanvas.height = targetSize * scale;
        
        const ctx = enhancedCanvas.getContext('2d');
        // 使用双线性插值提高图像质量
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        
        // 绘制原canvas到新canvas，放大
        ctx.drawImage(canvas, 0, 0, enhancedCanvas.width, enhancedCanvas.height);
        
        // 再缩小回原尺寸，但保持更高的图像质量
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetSize;
        finalCanvas.height = targetSize;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = "high";
        finalCtx.drawImage(enhancedCanvas, 0, 0, finalCanvas.width, finalCanvas.height);
        
        // 使用PNG格式保存结果
        finalCanvas.toBlob((enhancedBlob) => {
            console.log(`增强后图像大小: ${formatFileSize(enhancedBlob.size)}`);
            handleProcessedImage(enhancedBlob, targetSize, 1.0, false, 'image/png');
        }, 'image/png');
    }

    // 尝试找到最佳的文件格式处理图片
    function tryOptimalFormat(canvas, initialQuality, targetSize) {
        // 首先尝试PNG格式
        canvas.toBlob((pngBlob) => {
            console.log(`PNG格式大小: ${formatFileSize(pngBlob.size)}`);

            const maxSize = 500 * 1024; // 500KB
            const targetMinSize = 400 * 1024; // 400KB
            
            if (pngBlob.size > maxSize) {
                // PNG太大，使用JPEG格式
                processWithJpeg(canvas, initialQuality, targetSize);
            } else if (pngBlob.size < targetMinSize) {
                // PNG太小，但与JPEG格式比较
                canvas.toBlob((jpegBlob) => {
                    console.log(`JPEG (100%)格式大小: ${formatFileSize(jpegBlob.size)}`);
                    
                    // 如果JPEG格式更大且在范围内，使用JPEG
                    if (jpegBlob.size > pngBlob.size && jpegBlob.size <= maxSize) {
                        handleProcessedImage(jpegBlob, targetSize, initialQuality, true, 'image/jpeg');
                    } else {
                        // 否则使用PNG
                        handleProcessedImage(pngBlob, targetSize, initialQuality, false, 'image/png');
                    }
                }, 'image/jpeg', 1.0); // 尝试100%质量的JPEG
            } else {
                // PNG大小合适，直接使用
                handleProcessedImage(pngBlob, targetSize, initialQuality, false, 'image/png');
            }
        }, 'image/png');
    }

    // 使用JPEG格式处理图片
    function processWithJpeg(canvas, initialQuality, targetSize) {
        const maxSize = 500 * 1024; // 500KB
        const targetMinSize = 400 * 1024; // 400KB
        const minQuality = 0.7; // 提高最低质量以保持更好的清晰度
        const maxQuality = 1.0;
        
        // 首先尝试最高质量
        let highQuality = maxQuality;
        let lowQuality = minQuality;
        let currentQuality = highQuality;
        let lastGoodQuality = currentQuality;
        let lastGoodBlob = null;
        
        // 二分查找最佳质量
        function findOptimalQuality(attempt = 0, maxAttempts = 8) {
            // 转换为Blob数据
            canvas.toBlob((blob) => {
                const blobSize = blob.size;
                console.log(`JPEG尝试 #${attempt}: 质量=${currentQuality.toFixed(2)}, 大小=${formatFileSize(blobSize)}`);
                
                // 如果这是一个有效的质量（大小<=500KB），保存它
                if (blobSize <= maxSize) {
                    lastGoodQuality = currentQuality;
                    lastGoodBlob = blob;
                }
                
                if (attempt >= maxAttempts) {
                    // 达到最大尝试次数
                    if (lastGoodBlob) {
                        // 使用最后一个有效的质量
                        handleProcessedImage(lastGoodBlob, targetSize, initialQuality, 
                          lastGoodQuality < initialQuality, 'image/jpeg');
                    } else {
                        // 如果没有找到有效质量，使用最低质量
                        canvas.toBlob((finalBlob) => {
                            handleProcessedImage(finalBlob, targetSize, initialQuality, true, 'image/jpeg');
                        }, 'image/jpeg', minQuality);
                    }
                    return;
                }
                
                if (blobSize <= maxSize && blobSize >= targetMinSize) {
                    // 在目标范围内，完美!
                    handleProcessedImage(blob, targetSize, initialQuality, 
                      currentQuality < initialQuality, 'image/jpeg');
                } else if (blobSize > maxSize) {
                    // 文件太大，降低质量
                    highQuality = currentQuality;
                    currentQuality = (currentQuality + lowQuality) / 2;
                    findOptimalQuality(attempt + 1, maxAttempts);
                } else {
                    // 文件太小，提高质量
                    lowQuality = currentQuality;
                    currentQuality = (currentQuality + highQuality) / 2;
                    
                    // 如果已经接近最高质量但文件仍然太小
                    if (currentQuality > 0.95 || (highQuality - lowQuality) < 0.05) {
                        if (lastGoodBlob) {
                            // 使用最后一个有效质量的blob
                            handleProcessedImage(lastGoodBlob, targetSize, initialQuality, 
                              lastGoodQuality < initialQuality, 'image/jpeg');
                        } else {
                            // 使用最高质量
                            canvas.toBlob((maxBlob) => {
                                handleProcessedImage(maxBlob, targetSize, initialQuality, false, 'image/jpeg');
                            }, 'image/jpeg', 1.0);
                        }
                        return;
                    }
                    
                    findOptimalQuality(attempt + 1, maxAttempts);
                }
            }, 'image/jpeg', currentQuality);
        }
        
        // 开始查找最佳质量
        findOptimalQuality();
    }
    
    // 处理最终图像
    function handleProcessedImage(blob, targetSize, initialQuality, showQualityWarning, mimeType) {
        const imageUrl = URL.createObjectURL(blob);
        
        // 更新UI
        resultImage.src = imageUrl;
        newSize.textContent = `${targetSize} x ${targetSize}`;
        newFileSize.textContent = formatFileSize(blob.size);
        
        // 显示图片格式信息
        const formatInfo = document.getElementById('format-info');
        if (formatInfo) {
            if (mimeType === 'image/png') {
                formatInfo.textContent = 'PNG';
            } else if (mimeType === 'image/webp') {
                formatInfo.textContent = 'WebP';
            } else {
                formatInfo.textContent = 'JPEG';
            }
        }
        
        // 更新下载按钮
        let extension = 'jpg';
        if (mimeType === 'image/png') {
            extension = 'png';
        } else if (mimeType === 'image/webp') {
            extension = 'webp';
        }
        
        downloadBtn.href = imageUrl;
        downloadBtn.download = `image-${targetSize}x${targetSize}.${extension}`;
        
        // 显示结果和警告（如果需要）
        resultContainer.classList.remove('hidden');
        
        // 显示或隐藏警告
        if (showQualityWarning) {
            sizeWarning.classList.remove('hidden');
        } else {
            sizeWarning.classList.add('hidden');
        }
        
        // 显示或隐藏小尺寸图片处理信息
        const qualityInfo = document.querySelector('.quality-info');
        if (qualityInfo) {
            if (targetSize <= 50) {
                qualityInfo.style.display = 'block';
            } else {
                qualityInfo.style.display = 'none';
            }
        }
        
        // 显示或隐藏大尺寸图片处理信息
        const largeImageInfo = document.querySelector('.large-image-info');
        if (largeImageInfo) {
            if (targetSize >= 640) {
                largeImageInfo.style.display = 'block';
            } else {
                largeImageInfo.style.display = 'none';
            }
        }
        
        // 隐藏矩形图片提示
        const rectangleImageInfo = document.querySelector('.rectangle-image-info');
        if (rectangleImageInfo) {
            rectangleImageInfo.style.display = 'none';
        }
    }

    // 更新下载按钮
    function updateDownloadButton(blob, size) {
        const imageUrl = URL.createObjectURL(blob);
        downloadBtn.href = imageUrl;
        downloadBtn.download = `image-${size}x${size}-transparent.png`;
    }
    
    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
    }

    // 处理大尺寸图片的专用函数
    function processLargeImage(canvas, initialQuality, targetSize) {
        console.log("处理大尺寸图片，使用优化设置");
        
        // 尝试JPEG格式，因为PNG对于大图片通常会过大
        const startQuality = Math.min(initialQuality, 0.9); // 最高使用90%质量
        
        canvas.toBlob((jpegBlob) => {
            console.log(`大图片 JPEG格式大小: ${formatFileSize(jpegBlob.size)}`);
            
            const maxSize = 500 * 1024; // 500KB
            
            if (jpegBlob.size > maxSize) {
                // 太大了，进一步压缩
                processWithJpeg(canvas, startQuality, targetSize);
            } else {
                // 大小合适，使用这个JPEG
                handleProcessedImage(jpegBlob, targetSize, initialQuality, 
                    startQuality < initialQuality, 'image/jpeg');
            }
        }, 'image/jpeg', startQuality);
    }

    // 调整图片为矩形尺寸
    function resizeImageToRectangle(file, width, height, initialQuality) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 创建canvas进行图片处理
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                // 绘制图片
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                
                // 计算裁剪方式 (保持宽高比)
                const sourceWidth = img.width;
                const sourceHeight = img.height;
                
                // 计算宽高比
                const targetRatio = width / height;
                const sourceRatio = sourceWidth / sourceHeight;
                
                let sourceX = 0;
                let sourceY = 0;
                let usedSourceWidth = sourceWidth;
                let usedSourceHeight = sourceHeight;
                
                // 基于源图像和目标图像的宽高比调整裁剪区域
                if (sourceRatio > targetRatio) {
                    // 源图像更宽，需要裁剪宽度
                    usedSourceWidth = sourceHeight * targetRatio;
                    sourceX = (sourceWidth - usedSourceWidth) / 2;
                } else if (sourceRatio < targetRatio) {
                    // 源图像更高，需要裁剪高度
                    usedSourceHeight = sourceWidth / targetRatio;
                    sourceY = (sourceHeight - usedSourceHeight) / 2;
                }
                
                // 绘制并裁剪图片为矩形
                ctx.drawImage(
                    img,
                    sourceX, sourceY, usedSourceWidth, usedSourceHeight,
                    0, 0, width, height
                );
                
                // 处理矩形图片
                processRectangleImage(canvas, width, height, initialQuality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // 处理矩形图片
    function processRectangleImage(canvas, width, height, initialQuality) {
        console.log("处理矩形图片，尺寸: " + width + "x" + height);
        
        // 尝试使用JPEG格式
        const startQuality = Math.min(initialQuality, 0.9);
        
        canvas.toBlob((jpegBlob) => {
            console.log(`矩形图片 JPEG格式大小: ${formatFileSize(jpegBlob.size)}`);
            
            const maxSize = 500 * 1024; // 500KB
            
            if (jpegBlob.size > maxSize) {
                // 太大了，需要压缩
                compressRectangleImage(canvas, width, height, startQuality);
            } else {
                // 大小合适，使用这个JPEG
                handleRectangleImage(jpegBlob, width, height, initialQuality, 
                    startQuality < initialQuality, 'image/jpeg');
            }
        }, 'image/jpeg', startQuality);
    }
    
    // 压缩矩形图片
    function compressRectangleImage(canvas, width, height, initialQuality) {
        const maxSize = 500 * 1024; // 500KB
        const minQuality = 0.6; // 矩形图片通常较大，可以适当降低最低质量
        const maxQuality = initialQuality;
        
        let highQuality = maxQuality;
        let lowQuality = minQuality;
        let currentQuality = highQuality;
        let lastGoodQuality = currentQuality;
        let lastGoodBlob = null;
        
        // 二分查找最佳质量
        function findOptimalQuality(attempt = 0, maxAttempts = 8) {
            canvas.toBlob((blob) => {
                const blobSize = blob.size;
                console.log(`矩形图片压缩尝试 #${attempt}: 质量=${currentQuality.toFixed(2)}, 大小=${formatFileSize(blobSize)}`);
                
                if (blobSize <= maxSize) {
                    lastGoodQuality = currentQuality;
                    lastGoodBlob = blob;
                }
                
                if (attempt >= maxAttempts) {
                    // 达到最大尝试次数
                    if (lastGoodBlob) {
                        handleRectangleImage(lastGoodBlob, width, height, initialQuality, 
                            lastGoodQuality < initialQuality, 'image/jpeg');
                    } else {
                        canvas.toBlob((finalBlob) => {
                            handleRectangleImage(finalBlob, width, height, initialQuality, true, 'image/jpeg');
                        }, 'image/jpeg', minQuality);
                    }
                    return;
                }
                
                if (blobSize <= maxSize && blobSize >= maxSize * 0.8) {
                    // 在目标范围内 (80%-100% of maxSize)
                    handleRectangleImage(blob, width, height, initialQuality, 
                        currentQuality < initialQuality, 'image/jpeg');
                } else if (blobSize > maxSize) {
                    // 文件太大，降低质量
                    highQuality = currentQuality;
                    currentQuality = (currentQuality + lowQuality) / 2;
                    findOptimalQuality(attempt + 1, maxAttempts);
                } else {
                    // 文件太小，提高质量
                    lowQuality = currentQuality;
                    currentQuality = (currentQuality + highQuality) / 2;
                    
                    if (currentQuality > 0.95 || (highQuality - lowQuality) < 0.05) {
                        if (lastGoodBlob) {
                            handleRectangleImage(lastGoodBlob, width, height, initialQuality, 
                                lastGoodQuality < initialQuality, 'image/jpeg');
                        } else {
                            canvas.toBlob((maxBlob) => {
                                handleRectangleImage(maxBlob, width, height, initialQuality, false, 'image/jpeg');
                            }, 'image/jpeg', maxQuality);
                        }
                        return;
                    }
                    
                    findOptimalQuality(attempt + 1, maxAttempts);
                }
            }, 'image/jpeg', currentQuality);
        }
        
        findOptimalQuality();
    }
    
    // 处理最终的矩形图片
    function handleRectangleImage(blob, width, height, initialQuality, showQualityWarning, mimeType) {
        const imageUrl = URL.createObjectURL(blob);
        
        // 更新UI
        resultImage.src = imageUrl;
        newSize.textContent = `${width} x ${height}`;
        newFileSize.textContent = formatFileSize(blob.size);
        
        // 显示图片格式信息
        const formatInfo = document.getElementById('format-info');
        if (formatInfo) {
            formatInfo.textContent = 'JPEG';
        }
        
        // 更新下载按钮
        downloadBtn.href = imageUrl;
        downloadBtn.download = `image-${width}x${height}-transparent.png`;
        
        // 显示结果和警告
        resultContainer.classList.remove('hidden');
        
        // 显示或隐藏质量警告
        if (showQualityWarning) {
            sizeWarning.classList.remove('hidden');
        } else {
            sizeWarning.classList.add('hidden');
        }
        
        // 隐藏其他信息提示
        const qualityInfo = document.querySelector('.quality-info');
        if (qualityInfo) {
            qualityInfo.style.display = 'none';
        }
        
        const largeImageInfo = document.querySelector('.large-image-info');
        if (largeImageInfo) {
            largeImageInfo.style.display = 'none';
        }
        
        // 显示矩形图片提示
        const rectangleImageInfo = document.querySelector('.rectangle-image-info');
        if (rectangleImageInfo) {
            rectangleImageInfo.style.display = 'block';
        }
    }

    // 抠图并调整大小功能
    function resizeAndRemoveBg(file, targetSize, initialQuality, threshold) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 创建canvas进行图片处理
                const canvas = document.createElement('canvas');
                canvas.width = targetSize;
                canvas.height = targetSize;
                
                // 绘制图片
                const ctx = canvas.getContext('2d');
                
                // 清空画布，设置透明背景
                ctx.clearRect(0, 0, targetSize, targetSize);
                
                // 计算裁剪方式（正方形裁剪）
                let sourceX = 0;
                let sourceY = 0;
                let sourceWidth = img.width;
                let sourceHeight = img.height;
                
                if (img.width > img.height) {
                    sourceX = (img.width - img.height) / 2;
                    sourceWidth = img.height;
                } else if (img.height > img.width) {
                    sourceY = (img.height - img.width) / 2;
                    sourceHeight = img.width;
                }
                
                // 首先绘制图片到临时canvas以便进行抠图处理
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = sourceWidth;
                tempCanvas.height = sourceHeight;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(
                    img,
                    sourceX, sourceY, sourceWidth, sourceHeight,
                    0, 0, sourceWidth, sourceHeight
                );
                
                // 获取图片数据以进行处理
                const imageData = tempCtx.getImageData(0, 0, sourceWidth, sourceHeight);
                const data = imageData.data;
                
                // 使用颜色边缘检测算法去除背景
                removeBackground(imageData, threshold);
                
                // 将处理后的图像数据放回临时画布
                tempCtx.putImageData(imageData, 0, 0);
                
                // 绘制处理后的图像到最终canvas，并调整大小
                ctx.drawImage(tempCanvas, 0, 0, targetSize, targetSize);
                
                // 使用PNG格式保存（保留透明度）
                canvas.toBlob((blob) => {
                    handleProcessedImageWithBgRemoved(blob, targetSize, initialQuality, false, 'image/png');
                }, 'image/png', 1.0);  // 使用100%质量的PNG以保留透明度
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // 去除背景函数（使用颜色边缘检测算法）
    function removeBackground(imageData, threshold) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // 步骤1: 找到可能的背景颜色（使用边缘像素的平均颜色）
        let edgePixels = [];
        
        // 收集图像边缘的所有像素
        for (let x = 0; x < width; x++) {
            edgePixels.push(getPixelColor(data, x, 0, width));
            edgePixels.push(getPixelColor(data, x, height - 1, width));
        }
        
        for (let y = 1; y < height - 1; y++) {
            edgePixels.push(getPixelColor(data, 0, y, width));
            edgePixels.push(getPixelColor(data, width - 1, y, width));
        }
        
        // 计算边缘像素的平均颜色
        const avgColor = calculateAverageColor(edgePixels);
        
        // 步骤2: 遍历所有像素，将与背景颜色相似的像素设为透明
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const pixelColor = {r: data[i], g: data[i + 1], b: data[i + 2]};
                
                // 计算像素与背景色的相似度
                const similarity = calculateColorSimilarity(pixelColor, avgColor);
                
                // 如果相似度超过阈值，则认为是背景，设置为透明
                if (similarity > threshold) {
                    data[i + 3] = 0; // 设置alpha通道为0（完全透明）
                }
            }
        }
        
        return imageData;
    }
    
    // 辅助函数：获取指定坐标的像素颜色
    function getPixelColor(data, x, y, width) {
        const i = (y * width + x) * 4;
        return {
            r: data[i],
            g: data[i + 1],
            b: data[i + 2]
        };
    }
    
    // 辅助函数：计算平均颜色
    function calculateAverageColor(colors) {
        let sumR = 0, sumG = 0, sumB = 0;
        
        for (let color of colors) {
            sumR += color.r;
            sumG += color.g;
            sumB += color.b;
        }
        
        return {
            r: Math.round(sumR / colors.length),
            g: Math.round(sumG / colors.length),
            b: Math.round(sumB / colors.length)
        };
    }
    
    // 辅助函数：计算两个颜色的相似度（0-1之间，1为完全相同）
    function calculateColorSimilarity(color1, color2) {
        // 使用欧几里得距离计算颜色相似度
        const distance = Math.sqrt(
            Math.pow(color1.r - color2.r, 2) +
            Math.pow(color1.g - color2.g, 2) +
            Math.pow(color1.b - color2.b, 2)
        );
        
        // 归一化到0-1范围，255*sqrt(3)是最大可能距离
        return 1 - (distance / (255 * Math.sqrt(3)));
    }
    
    // 处理矩形图片的抠图功能
    function resizeAndRemoveBgRectangle(file, width, height, initialQuality, threshold) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 创建canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                // 计算缩放比例保持宽高比
                let scaleFactor = Math.min(width / img.width, height / img.height);
                let scaledWidth = img.width * scaleFactor;
                let scaledHeight = img.height * scaleFactor;
                
                // 居中放置图片
                let x = (width - scaledWidth) / 2;
                let y = (height - scaledHeight) / 2;
                
                // 清空画布，设置透明背景
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, width, height);
                
                // 首先绘制到临时canvas以进行抠图处理
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(img, 0, 0);
                
                // 获取图片数据以进行处理
                const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
                
                // 使用颜色边缘检测算法去除背景
                removeBackground(imageData, threshold);
                
                // 将处理后的图像数据放回临时画布
                tempCtx.putImageData(imageData, 0, 0);
                
                // 绘制处理后的图像到最终canvas，并调整大小
                ctx.drawImage(tempCanvas, 0, 0, img.width, img.height, x, y, scaledWidth, scaledHeight);
                
                // 使用PNG格式保存（保留透明度）
                canvas.toBlob((blob) => {
                    handleRectangleImageWithBgRemoved(blob, width, height, initialQuality, false, 'image/png');
                }, 'image/png', 1.0);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // 处理抠图后的方形图像结果
    function handleProcessedImageWithBgRemoved(blob, targetSize, initialQuality, showQualityWarning, mimeType) {
        const imageUrl = URL.createObjectURL(blob);
        
        // 更新UI
        resultImage.src = imageUrl;
        newSize.textContent = `${targetSize} x ${targetSize}`;
        newFileSize.textContent = formatFileSize(blob.size);
        
        // 显示图片格式信息
        const formatInfo = document.getElementById('format-info');
        if (formatInfo) {
            formatInfo.textContent = 'PNG (透明背景)';
        }
        
        // 显示质量警告（如果需要）
        if (showQualityWarning) {
            sizeWarning.classList.remove('hidden');
        } else {
            sizeWarning.classList.add('hidden');
        }
        
        // 显示抠图信息
        displayBgRemovedInfo(true);
        
        // 隐藏其他特殊提示
        const qualityInfo = document.querySelector('.quality-info');
        const largeImageInfo = document.querySelector('.large-image-info');
        
        if (qualityInfo) qualityInfo.style.display = 'none';
        if (largeImageInfo) largeImageInfo.style.display = 'none';
        
        // 显示结果区域
        resultContainer.classList.remove('hidden');
        
        // 更新下载按钮
        updateDownloadButton(blob, targetSize);
    }
    
    // 处理抠图后的矩形图像结果
    function handleRectangleImageWithBgRemoved(blob, width, height, initialQuality, showQualityWarning, mimeType) {
        const imageUrl = URL.createObjectURL(blob);
        
        // 更新UI
        resultImage.src = imageUrl;
        newSize.textContent = `${width} x ${height}`;
        newFileSize.textContent = formatFileSize(blob.size);
        
        // 显示图片格式信息
        const formatInfo = document.getElementById('format-info');
        if (formatInfo) {
            formatInfo.textContent = 'PNG (透明背景)';
        }
        
        // 显示质量警告（如果需要）
        if (showQualityWarning) {
            sizeWarning.classList.remove('hidden');
        } else {
            sizeWarning.classList.add('hidden');
        }
        
        // 显示抠图信息
        displayBgRemovedInfo(false);
        
        // 隐藏其他特殊提示
        const qualityInfo = document.querySelector('.quality-info');
        const largeImageInfo = document.querySelector('.large-image-info');
        
        if (qualityInfo) qualityInfo.style.display = 'none';
        if (largeImageInfo) largeImageInfo.style.display = 'none';
        
        // 显示矩形图片信息
        const rectangleImageInfo = document.querySelector('.rectangle-image-info');
        if (rectangleImageInfo) {
            rectangleImageInfo.style.display = 'block';
        }
        
        // 显示结果区域
        resultContainer.classList.remove('hidden');
        
        // 更新下载按钮
        updateDownloadButtonRectangle(blob, width, height);
    }
    
    // 显示抠图信息
    function displayBgRemovedInfo(isSquare) {
        // 检查是否已存在信息元素
        let bgRemovedInfo = document.querySelector('.bg-removed-info');
        
        // 如果不存在，创建一个新的
        if (!bgRemovedInfo) {
            bgRemovedInfo = document.createElement('div');
            bgRemovedInfo.className = 'bg-removed-info';
            
            const infoText = document.createElement('p');
            infoText.textContent = '注意: 图片背景已被移除，保存为透明PNG格式';
            
            bgRemovedInfo.appendChild(infoText);
            document.querySelector('.result-info').appendChild(bgRemovedInfo);
        }
        
        // 显示信息
        bgRemovedInfo.style.display = 'block';
    }
    
    // 更新正方形图片的下载按钮
    function updateDownloadButton(blob, size) {
        // 更新下载链接
        const url = URL.createObjectURL(blob);
        downloadBtn.href = url;
        downloadBtn.download = `image-${size}x${size}-transparent.png`;
    }
    
    // 更新矩形图片的下载按钮
    function updateDownloadButtonRectangle(blob, width, height) {
        // 更新下载链接
        const url = URL.createObjectURL(blob);
        downloadBtn.href = url;
        downloadBtn.download = `image-${width}x${height}-transparent.png`;
    }
    
    // 批量下载按钮事件
    batchDownloadBtn.addEventListener('click', async () => {
        if (batchResults.length === 0) return;
        
        const successfulResults = batchResults.filter(result => result.success);
        if (successfulResults.length === 0) {
            alert('没有成功处理的图片可供下载！');
            return;
        }
        
        // 创建ZIP文件
        const zip = new JSZip();
        
        // 添加所有成功处理的图片到ZIP
        successfulResults.forEach((result, index) => {
            const fileName = getBatchFileName(result.file, result.size, result.format, result.backgroundRemoved);
            zip.file(fileName, result.blob);
        });
        
        try {
            // 生成ZIP文件
            const content = await zip.generateAsync({type: 'blob'});
            
            // 下载ZIP文件
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `processed_images_${new Date().getTime()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('创建ZIP文件时出错:', error);
            alert('创建ZIP文件时出错，请尝试单独下载每张图片。');
        }
    });
    
    // 智能建议分割参数
    function suggestSplitParameters(width, height) {
        const aspectRatio = width / height;
        const totalPixels = width * height;
        
        // 根据图片大小和比例智能建议
        if (totalPixels > 2000000) { // 大图片（超过2百万像素）
            if (aspectRatio > 2) {
                // 宽图，建议垂直分割
                splitRowsInput.value = 2;
                splitColsInput.value = 3;
            } else if (aspectRatio < 0.5) {
                // 高图，建议水平分割
                splitRowsInput.value = 3;
                splitColsInput.value = 2;
            } else {
                // 方形或接近方形，建议网格分割
                splitRowsInput.value = 2;
                splitColsInput.value = 2;
            }
        } else if (totalPixels > 500000) { // 中等图片
            splitRowsInput.value = 2;
            splitColsInput.value = 2;
        } else { // 小图片
            splitRowsInput.value = 2;
            splitColsInput.value = 2;
        }
        
        // 建议每块尺寸
        const targetSize = Math.min(width, height) / Math.max(parseInt(splitRowsInput.value), parseInt(splitColsInput.value));
        if (targetSize >= 640) {
            splitSizeSelect.value = '640';
        } else if (targetSize >= 320) {
            splitSizeSelect.value = '320';
        } else if (targetSize >= 240) {
            splitSizeSelect.value = '240';
        } else {
            splitSizeSelect.value = '160';
        }
    }
    
    // 分割按钮点击事件
    splitBtn.addEventListener('click', () => {
        if (!splitFile || !splitImage) return;
        
        const splitMode = document.querySelector('input[name="split-mode"]:checked').value;
        const quality = parseInt(splitQualitySlider.value) / 100;
        const outputFormat = document.querySelector('input[name="split-format"]:checked').value;
        const targetSize = splitSizeSelect.value;
        
        if (splitMode === 'grid') {
            const rows = parseInt(splitRowsInput.value);
            const cols = parseInt(splitColsInput.value);
            splitImageGrid(splitFile, splitImage, rows, cols, quality, outputFormat, targetSize);
        } else {
            const count = parseInt(splitCountInput.value);
            const layout = splitLayoutSelect.value;
            splitImageCustom(splitFile, splitImage, count, layout, quality, outputFormat, targetSize);
        }
    });
    
    // 网格分割功能
    async function splitImageGrid(file, img, rows, cols, quality, format, targetSize) {
        if (isProcessingSplit) return;
        
        isProcessingSplit = true;
        splitResults = [];
        
        // 显示分割结果区域
        splitResultContainer.classList.remove('hidden');
        splitImagesGrid.innerHTML = '';
        
        // 更新分割信息
        splitMethod.textContent = `网格分割 (${rows}×${cols})`;
        splitTotalCount.textContent = rows * cols;
        
        const pieceWidth = img.width / cols;
        const pieceHeight = img.height / rows;
        
        // 创建临时canvas用于裁剪
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        let processedCount = 0;
        
        // 逐个处理每个分块
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * pieceWidth;
                const y = row * pieceHeight;
                
                try {
                    const result = await createSplitPiece(img, x, y, pieceWidth, pieceHeight, row, col, rows, cols, quality, format, targetSize);
                    splitResults.push(result);
                    displaySplitResultItem(result, processedCount);
                    processedCount++;
                } catch (error) {
                    console.error(`处理分块 [${row},${col}] 时出错:`, error);
                }
            }
        }
        
        isProcessingSplit = false;
        
        // 显示下载按钮
        if (splitResults.length > 0) {
            splitDownloadAllBtn.style.display = 'inline-block';
        }
    }
    
    // 创建单个分割块
    function createSplitPiece(img, x, y, width, height, row, col, totalRows, totalCols, quality, format, targetSize) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置画布尺寸
            let finalWidth = width;
            let finalHeight = height;
            
            if (targetSize !== 'original') {
                const size = parseInt(targetSize);
                const scale = Math.min(size / width, size / height);
                finalWidth = width * scale;
                finalHeight = height * scale;
            }
            
            canvas.width = finalWidth;
            canvas.height = finalHeight;
            
            // 裁剪并绘制图片块
            ctx.drawImage(
                img,
                x, y, width, height,  // 源矩形
                0, 0, finalWidth, finalHeight  // 目标矩形
            );
            
            // 转换为Blob
            const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
            canvas.toBlob((blob) => {
                resolve({
                    blob: blob,
                    width: finalWidth,
                    height: finalHeight,
                    row: row,
                    col: col,
                    position: `${row + 1}-${col + 1}`,
                    format: mimeType,
                    fileName: generateSplitFileName(splitFile.name, row, col, totalRows, totalCols, format)
                });
            }, mimeType, quality);
        });
    }
    
    // 自定义分割功能
    async function splitImageCustom(file, img, count, layout, quality, format, targetSize) {
        if (isProcessingSplit) return;
        
        isProcessingSplit = true;
        splitResults = [];
        
        // 显示分割结果区域
        splitResultContainer.classList.remove('hidden');
        splitImagesGrid.innerHTML = '';
        
        // 更新分割信息
        splitMethod.textContent = `自定义分割 (${count}块, ${getLayoutName(layout)})`;
        splitTotalCount.textContent = count;
        
        // 计算分割布局
        const layoutInfo = calculateCustomLayout(img.width, img.height, count, layout);
        
        // 创建临时canvas用于裁剪
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        let processedCount = 0;
        
        // 逐个处理每个分块
        for (let i = 0; i < layoutInfo.pieces.length; i++) {
            const piece = layoutInfo.pieces[i];
            
            try {
                const result = await createSplitPiece(
                    img, 
                    piece.x, piece.y, piece.width, piece.height, 
                    piece.row, piece.col, layoutInfo.rows, layoutInfo.cols,
                    quality, format, targetSize
                );
                splitResults.push(result);
                displaySplitResultItem(result, processedCount);
                processedCount++;
            } catch (error) {
                console.error(`处理分块 ${i} 时出错:`, error);
            }
        }
        
        isProcessingSplit = false;
        
        // 显示下载按钮
        if (splitResults.length > 0) {
            splitDownloadAllBtn.style.display = 'inline-block';
        }
    }
    
    // 计算自定义分割布局
    function calculateCustomLayout(imgWidth, imgHeight, count, layout) {
        let rows, cols;
        
        if (layout === 'horizontal') {
            rows = 1;
            cols = count;
        } else if (layout === 'vertical') {
            rows = count;
            cols = 1;
        } else if (layout === 'square') {
            // 计算最接近正方形的网格
            cols = Math.ceil(Math.sqrt(count));
            rows = Math.ceil(count / cols);
        } else { // auto
            // 根据图片比例自动选择布局
            const aspectRatio = imgWidth / imgHeight;
            if (aspectRatio > 2) {
                // 宽图，使用水平布局
                cols = count;
                rows = 1;
            } else if (aspectRatio < 0.5) {
                // 高图，使用垂直布局
                cols = 1;
                rows = count;
            } else {
                // 方形或接近方形，使用网格布局
                cols = Math.ceil(Math.sqrt(count));
                rows = Math.ceil(count / cols);
            }
        }
        
        const pieceWidth = imgWidth / cols;
        const pieceHeight = imgHeight / rows;
        
        // 生成分块信息
        const pieces = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const index = row * cols + col;
                if (index < count) {
                    pieces.push({
                        x: col * pieceWidth,
                        y: row * pieceHeight,
                        width: pieceWidth,
                        height: pieceHeight,
                        row: row,
                        col: col
                    });
                }
            }
        }
        
        return { rows, cols, pieces };
    }
    
    // 获取布局名称
    function getLayoutName(layout) {
        const names = {
            'auto': '自动',
            'horizontal': '水平',
            'vertical': '垂直',
            'square': '方形网格'
        };
        return names[layout] || layout;
    }
    
    // 生成分割文件名
    function generateSplitFileName(originalName, row, col, totalRows, totalCols, format) {
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        const extension = format === 'png' ? 'png' : 'jpg';
        const position = `${row + 1}-${col + 1}`;
        return `${nameWithoutExt}_split_${totalRows}x${totalCols}_${position}.${extension}`;
    }
    
    // 显示分割结果项
    function displaySplitResultItem(result, index) {
        const div = document.createElement('div');
        div.className = 'split-result-item';
        
        const imageUrl = URL.createObjectURL(result.blob);
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `分割块 ${result.position}`;
        
        const info = document.createElement('div');
        info.className = 'item-info';
        info.innerHTML = `
            <div class="item-position">位置: ${result.position}</div>
            <div class="item-size">${Math.round(result.width)} × ${Math.round(result.height)}</div>
        `;
        
        const downloadLink = document.createElement('a');
        downloadLink.className = 'download-single';
        downloadLink.href = imageUrl;
        downloadLink.textContent = '下载';
        downloadLink.download = result.fileName;
        
        div.appendChild(img);
        div.appendChild(info);
        div.appendChild(downloadLink);
        
        splitImagesGrid.appendChild(div);
    }
    
    // 分割重置按钮事件
    splitResetBtn.addEventListener('click', () => {
        resetSplitMode();
    });
    
    // 分割批量下载按钮事件
    splitDownloadAllBtn.addEventListener('click', async () => {
        if (splitResults.length === 0) return;
        
        // 创建ZIP文件
        const zip = new JSZip();
        
        // 添加所有分割图片到ZIP
        splitResults.forEach((result, index) => {
            zip.file(result.fileName, result.blob);
        });
        
        try {
            // 生成ZIP文件
            const content = await zip.generateAsync({type: 'blob'});
            
            // 下载ZIP文件
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `split_images_${new Date().getTime()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('创建ZIP文件时出错:', error);
            alert('创建ZIP文件时出错，请尝试单独下载每张图片。');
        }
    });
}); 