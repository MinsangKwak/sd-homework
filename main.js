// 초기 데이터
let data = [
	{ id: 0, value: 75 },
	{ id: 1, value: 20 },
	{ id: 2, value: 80 },
	{ id: 3, value: 100 },
	{ id: 4, value: 70 },
];

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", function () {
	renderTable();
	renderChart();
	initEvents();
});

// 테이블 렌더링
function renderTable() {
	const tbody = document.querySelector(".table-container tbody");
	tbody.innerHTML = "";

	data.forEach((item) => {
		const tr = document.createElement("tr");

		tr.innerHTML = `
        <td>${item.id}</td>
        <td>
          <input type="number" class="input input-text input-number" value="${item.value}" data-id="${item.id}" min="0" max="100" disabled>
        </td>
        <td>
          <button type="button" class="btn btn-outline btn-sm btn-delete" data-id="${item.id}">삭제</button>
        </td>
      `;

		tbody.appendChild(tr);
	});
	updateJSONEditor(); // 테이블 변경 시 textarea도 동기화
}

// 그래프 렌더링 (범례 포함)
function renderChart() {
	const chart = document.getElementById("chart");
	chart.innerHTML = "";

	const maxHeight = 150;

	data.forEach((item) => {
		const group = document.createElement("div");
		group.className = "chart-bar-group";

		const bar = document.createElement("div");
		bar.className = "chart-bar";
		bar.style.height = `${(item.value / 100) * maxHeight}px`;

		const label = document.createElement("div");
		label.className = "chart-label";
		label.textContent = item.id;

		group.appendChild(bar);
		group.appendChild(label);
		chart.appendChild(group);
	});
}

// 이벤트 초기화
function initEvents() {
	document
		.querySelector(".table-container")
		.addEventListener("click", function (e) {
			if (e.target.classList.contains("btn-delete")) handleDelete(e);
		});

	document
		.querySelector(".btn-apply")
		.addEventListener("click", applyChanges);
	document.querySelector(".btn-add").addEventListener("click", addData);
	document
		.querySelector("#advanced-edit-heading ~ button")
		.addEventListener("click", applyJSONEdit);

	document
		.querySelector(".table-container")
		.addEventListener("input", restrictNumberInput);
	document
		.querySelector(".value-container")
		.addEventListener("input", restrictNumberInput);
}

// 삭제 기능
function handleDelete(e) {
	const id = parseInt(e.target.getAttribute("data-id"), 10);
	data = data.filter((item) => item.id !== id);
	renderTable();
	renderChart();
	updateJSONEditor();
}

// 변경값 적용 (유효성 검사)
function applyChanges() {
	const inputs = document.querySelectorAll(".table-container tbody input");
	let valid = true;

	inputs.forEach((input) => {
		const id = parseInt(input.getAttribute("data-id"), 10);
		const value = parseInt(input.value, 10);

		if (isNaN(value) || value < 0 || value > 100) {
			alert(
				`입력한 값(${value})이 유효하지 않습니다. 0에서 100 사이의 숫자만 입력 가능합니다.`
			);
			valid = false;
		}

		if (valid) {
			const item = data.find((item) => item.id === id);
			if (item) item.value = value;
		}
	});

	if (valid) {
		renderChart();
		updateJSONEditor();
	} else {
		renderTable(); // 유효하지 않을 시 원상복구
	}
}

// 데이터 추가 (유효성 검사)
function addData() {
	const idInput = document.getElementById("data-id-input");
	const valueInput = document.getElementById("data-value-input");
	const id = parseInt(idInput.value, 10);
	const value = parseInt(valueInput.value, 10);

	if (isNaN(id) || isNaN(value) || value < 0 || value > 100) {
		alert("ID와 값은 숫자로 입력해야 하고, 값은 0~100 사이만 가능합니다.");
		return;
	}

	if (data.some((item) => item.id === id)) {
		alert("이미 존재하는 ID입니다.");
		return;
	}

	data.push({ id, value });
	idInput.value = "";
	valueInput.value = "";

	renderTable();
	renderChart();
	updateJSONEditor();
}

// JSON 고급 편집
function applyJSONEdit() {
	const textarea = document.getElementById("json-code-edit");
	try {
		const newData = JSON.parse(textarea.value);

		if (
			!Array.isArray(newData) ||
			!newData.every(
				(item) =>
					"id" in item &&
					"value" in item &&
					typeof item.value === "number" &&
					item.value <= 100 &&
					item.value >= 0
			)
		) {
			alert(
				"JSON 형식 오류: ID와 값이 필요하며, 값은 0~100 사이여야 합니다."
			);
			return;
		}

		data = newData;
		renderTable();
		renderChart();
	} catch (error) {
		alert("JSON 형식에 오류가 있습니다.");
	}
}

// 숫자 입력 제한 및 즉시 알림창으로 유도
function restrictNumberInput(e) {
	const input = e.target;
	if (input.type === "number") {
		let val = parseInt(input.value, 10);
		if (val > 100 || val < 0) {
			alert("값은 0에서 100 사이의 숫자만 입력 가능합니다.");
			input.value = "";
		}
	}
}

// 고급 편집 textarea 동기화 함수
function updateJSONEditor() {
	const textarea = document.getElementById("json-code-edit");
	textarea.value = JSON.stringify(data, null, 2); // 들여쓰기 2칸으로 보기 좋게 출력
}
