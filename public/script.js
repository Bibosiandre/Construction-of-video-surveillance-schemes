const canvas = new fabric.Canvas('building-canvas', {
    width: 1600,
    height: 800,
    selection: false,
    backgroundColor: 'white'
});

// Добавляем тонкий контур
const borderRect = new fabric.Rect({
    left: 0,
    top: 0,
    width: 1600,
    height: 800,
    fill: '',
    stroke: 'black',
    strokeWidth: 1,
    selectable: false,
    evented: false
});
canvas.add(borderRect);

const addRectButton = document.getElementById('add-rect');
const addTextButton = document.getElementById('add-text');
const addCameraButton = document.getElementById('add-camera');
const deleteButton = document.getElementById('delete');
const zoomInButton = document.getElementById('zoom-in');
const zoomOutButton = document.getElementById('zoom-out');
const addFloorButton = document.getElementById('add-floor');
const deleteFloorButton = document.getElementById('delete-floor');
const addDrawingButton = document.getElementById('add-drawing');
const selectDrawingButton = document.getElementById('select-drawing');
const deleteDrawingButton = document.getElementById('delete-drawing');
const rectColorSelect = document.getElementById('rect-color');
const rectBorderSelect = document.getElementById('rect-border');
const cameraIconUpload = document.getElementById('camera-icon-upload');
const searchCameraInput = document.getElementById('search-camera');
const floorButtonsContainer = document.getElementById('floor-buttons');
const infoModal = document.getElementById('info-modal');
const cameraInfoForm = document.getElementById('camera-info-form');
const drawingListContainer = document.getElementById('drawing-list');

let currentFloor = 1;
let floors = { 1: [] };
let currentDrawing = 'Чертеж 1';
let drawings = { 'Чертеж 1': { 1: [] } };
let selectedCamera = null;
let isDragging = false;
let lastPosX, lastPosY;

canvas.on('mouse:down', function(e) {
    if (e.target && e.target.type === 'image' && e.target.cameraData) {
        selectedCamera = e.target;
        const cameraData = e.target.cameraData;
        document.getElementById('switch-name').value = cameraData.switchName;
        document.getElementById('port').value = cameraData.port;
        document.getElementById('camera-name').value = cameraData.cameraName;
        document.getElementById('ip-address').value = cameraData.ipAddress;
        document.getElementById('vlan').value = cameraData.vlan;
        infoModal.style.display = 'block';
    } else {
        isDragging = true;
        const pointer = canvas.getPointer(e.e);
        lastPosX = pointer.x;
        lastPosY = pointer.y;
    }
});

canvas.on('mouse:move', function(e) {
    if (isDragging) {
        const pointer = canvas.getPointer(e.e);
        const deltaX = pointer.x - lastPosX;
        const deltaY = pointer.y - lastPosY;
        canvas.relativePan({ x: deltaX, y: deltaY });
        lastPosX = pointer.x;
        lastPosY = pointer.y;
        
        // Ограничение перемещения
        const zoom = canvas.getZoom();
        const viewport = canvas.viewportTransform;
        if (viewport[4] > 0) viewport[4] = 0;
        if (viewport[5] > 0) viewport[5] = 0;
        if (viewport[4] < canvas.getWidth() - 1600 * zoom) viewport[4] = canvas.getWidth() - 1600 * zoom;
        if (viewport[5] < canvas.getHeight() - 800 * zoom) viewport[5] = canvas.getHeight() - 800 * zoom;
        canvas.setViewportTransform(viewport);
    }
});

canvas.on('mouse:up', function() {
    isDragging = false;
});

addRectButton.addEventListener('click', () => {
    const rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: rectColorSelect.value,
        width: 60,
        height: 60,
        stroke: rectBorderSelect.value,
        strokeWidth: 2
    });
    canvas.add(rect);
    floors[currentFloor].push(rect);
});

addTextButton.addEventListener('click', () => {
    const text = new fabric.Text('Текст', {
        left: 100,
        top: 100,
        fontSize: 20
    });
    canvas.add(text);
    floors[currentFloor].push(text);
});

addCameraButton.addEventListener('click', () => {
    if (cameraIconUpload.files.length > 0) {
        const file = cameraIconUpload.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            const url = event.target.result;
            fabric.Image.fromURL(url, function(img) {
                img.set({ left: 100, top: 100 });
                img.cameraData = {
                    switchName: '',
                    port: '',
                    cameraName: '',
                    ipAddress: '',
                    vlan: ''
                };
                canvas.add(img);
                floors[currentFloor].push(img);
            });
        };
        reader.readAsDataURL(file);
    } else {
        alert('Пожалуйста, загрузите иконку камеры.');
    }
});

deleteButton.addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        const index = floors[currentFloor].indexOf(activeObject);
        if (index > -1) {
            floors[currentFloor].splice(index, 1);
        }
    }
});

zoomInButton.addEventListener('click', () => {
    canvas.setZoom(canvas.getZoom() * 1.1);
});

zoomOutButton.addEventListener('click', () => {
    canvas.setZoom(canvas.getZoom() * 0.9);
});

addFloorButton.addEventListener('click', () => {
    const newFloor = Object.keys(floors).length + 1;
    floors[newFloor] = [];
    updateFloorButtons();
    currentFloor = newFloor;
    clearCanvas();
    drawFloor(currentFloor);
});

deleteFloorButton.addEventListener('click', () => {
    if (Object.keys(floors).length > 1) {
        delete floors[currentFloor];
        currentFloor = Object.keys(floors)[0];
        updateFloorButtons();
        clearCanvas();
        drawFloor(currentFloor);
    } else {
        alert('Нельзя удалить последний этаж.');
    }
});

addDrawingButton.addEventListener('click', () => {
    const drawingName = prompt('Введите название нового чертежа:');
    if (drawingName) {
        drawings[drawingName] = { 1: [] };
        currentDrawing = drawingName;
        floors = drawings[drawingName];
        currentFloor = 1;
        updateDrawingList();
        updateFloorButtons();
        clearCanvas();
        drawFloor(currentFloor);
    }
});

selectDrawingButton.addEventListener('click', () => {
    drawingListContainer.innerHTML = '';
    Object.keys(drawings).forEach(drawingName => {
        const button = document.createElement('button');
        button.textContent = drawingName;
        button.addEventListener('click', () => {
            currentDrawing = drawingName;
            floors = drawings[drawingName];
            currentFloor = Object.keys(floors)[0];
            updateDrawingList();
            updateFloorButtons();
            clearCanvas();
            drawFloor(currentFloor);
            drawingListContainer.style.display = 'none';
        });
        drawingListContainer.appendChild(button);
    });
    drawingListContainer.style.display = 'block';
});

deleteDrawingButton.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите удалить этот чертеж?')) {
        delete drawings[currentDrawing];
        const remainingDrawings = Object.keys(drawings);
        if (remainingDrawings.length > 0) {
            currentDrawing = remainingDrawings[0];
            floors = drawings[currentDrawing];
            currentFloor = Object.keys(floors)[0];
        } else {
            currentDrawing = 'Чертеж 1';
            drawings = { 'Чертеж 1': { 1: [] } };
            floors = drawings[currentDrawing];
            currentFloor = 1;
        }
        updateDrawingList();
        updateFloorButtons();
        clearCanvas();
        drawFloor(currentFloor);
    }
});

searchCameraInput.addEventListener('input', () => {
    const searchText = searchCameraInput.value.toLowerCase();
    canvas.getObjects('image').forEach(img => {
        if (img.cameraData && img.cameraData.cameraName.toLowerCase().includes(searchText)) {
            img.set('opacity', 1);
        } else {
            img.set('opacity', 0.5);
        }
    });
    canvas.renderAll();
});

cameraInfoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (selectedCamera) {
        selectedCamera.cameraData.switchName = document.getElementById('switch-name').value;
        selectedCamera.cameraData.port = document.getElementById('port').value;
        selectedCamera.cameraData.cameraName = document.getElementById('camera-name').value;
        selectedCamera.cameraData.ipAddress = document.getElementById('ip-address').value;
        selectedCamera.cameraData.vlan = document.getElementById('vlan').value;
        infoModal.style.display = 'none';
        selectedCamera = null;
    }
});

function updateFloorButtons() {
    floorButtonsContainer.innerHTML = '';
    Object.keys(floors).forEach(floor => {
        const button = document.createElement('button');
        button.textContent = `Этаж ${floor}`;
        button.addEventListener('click', () => {
            currentFloor = floor;
            clearCanvas();
            drawFloor(currentFloor);
        });
        floorButtonsContainer.appendChild(button);
    });
}

function updateDrawingList() {
    drawingListContainer.innerHTML = '';
    Object.keys(drawings).forEach(drawingName => {
        const button = document.createElement('button');
        button.textContent = drawingName;
        button.addEventListener('click', () => {
            currentDrawing = drawingName;
            floors = drawings[drawingName];
            currentFloor = Object.keys(floors)[0];
            updateFloorButtons();
            clearCanvas();
            drawFloor(currentFloor);
            drawingListContainer.style.display = 'none';
        });
        drawingListContainer.appendChild(button);
    });
}

function clearCanvas() {
    canvas.getObjects().forEach(obj => {
        if (obj !== borderRect) {
            canvas.remove(obj);
        }
    });
}

function drawFloor(floor) {
    floors[floor].forEach(obj => {
        canvas.add(obj);
    });
    canvas.renderAll();
}
