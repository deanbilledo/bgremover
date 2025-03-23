document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.querySelector('.browse-btn');
    const progressContainer = document.querySelector('.progress-container');
    const progressFill = document.querySelector('.progress-fill');
    const uploadMessage = document.querySelector('.upload-message');
    const resultContainer = document.querySelector('.result-container');
    const originalImage = document.getElementById('original-image');
    const processedImage = document.getElementById('processed-image');
    const downloadBtn = document.getElementById('download-btn');
    const tryAgainBtn = document.getElementById('try-again-btn');

    // Event listeners for drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    // Handle file drop
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            handleFiles(files);
        }
    }

    // Handle file selection via browse button
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFiles(fileInput.files);
        }
    });

    // Process the selected file
    function handleFiles(files) {
        const file = files[0];
        
        // Check if file is an image
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG, etc.)');
            return;
        }
        
        // Show progress bar
        uploadMessage.style.display = 'none';
        progressContainer.style.display = 'block';
        progressFill.style.width = '50%';
        
        // Create form data and upload file
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            progressFill.style.width = '90%';
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            progressFill.style.width = '100%';
            setTimeout(() => {
                // Hide upload area and show results
                dropArea.style.display = 'none';
                resultContainer.style.display = 'block';
                
                // Set images
                originalImage.src = data.original;
                processedImage.src = data.processed;
                
                // Set download button
                downloadBtn.addEventListener('click', () => {
                    downloadImage(data.processed);
                });
            }, 500);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while processing the image. Please try again.');
            resetUI();
        });
    }

    // Function to download the processed image
    function downloadImage(url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'background-removed.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Try again button
    tryAgainBtn.addEventListener('click', resetUI);

    // Reset UI to initial state
    function resetUI() {
        resultContainer.style.display = 'none';
        dropArea.style.display = 'block';
        uploadMessage.style.display = 'block';
        progressContainer.style.display = 'none';
        progressFill.style.width = '0%';
        fileInput.value = '';
    }
});