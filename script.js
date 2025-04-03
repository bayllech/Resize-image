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

    // 全局变量
    let originalFile = null;
    let originalImageWidth = 0;
    let originalImageHeight = 0;

    // 更新质量百分比显示
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = qualitySlider.value + '%';
    });
    
    // 更新抠图灵敏度百分比显示
    thresholdSlider.addEventListener('input', () => {
        thresholdValue.textContent = thresholdSlider.value + '%';
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

    // 处理图片按钮点击事件
    processBtn.addEventListener('click', () => {
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
}); 