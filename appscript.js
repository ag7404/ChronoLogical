let events = [];

let table = document.getElementById("schedule");

let timeInput = document.getElementById("time");
let detailsInput = document.getElementById("details");
let filesInput = document.getElementById("import");

let addButton = document.getElementById("add");
let removeAllButton = document.getElementById("rmv-all");
let exportButton = document.getElementById("export");
let importButton = document.getElementById("submit");

class Event {
	constructor(time, details) {
		this.time = time;
		this.details = details;
	}
}

function addEvent() {

	const userMilTime = timeInput.value;
	const userDetails = detailsInput.value;

	if(userMilTime === '' || userDetails === '') {
		alert("Your time and/or details are invalid.");
		return;
	}

	let isDuplicate = false;
	
	for(var i = 0; i < events.length; i++) {

		if(events[i].time === userMilTime && events[i].details === userDetails) {
			isDuplicate = true;
		}
		
		if(events[i].time > userMilTime) {
			break;
		}
	}

	if(isDuplicate) {
		alert("Event already exists.");
		return;
	}
	
	let newEvent = new Event(userMilTime, userDetails);
	events.push(newEvent);

	addRow(newEvent, i+1);

	console.log(JSON.stringify(events));
}

function addRow(eventObj, ind) {

	let newRow = table.insertRow(ind);
	newRow.addEventListener("click", removeEvent);

	let timeCell = newRow.insertCell(0);
	timeCell.textContent = toStandard(eventObj.time);

	let detailsCell = newRow.insertCell(1);
	detailsCell.textContent = eventObj.details;
	
}

function removeEvent(event) {
	const sure = confirm("Are you sure you would like to delete this event?");

	if(sure) {
		let time = toMilitary(event.target.parentNode.children[0].textContent);
		let details = event.target.parentNode.children[1].textContent;

		for(var i = 0; i < events.length; i++) {
			const thisEvent = events[i];

			if(thisEvent.time === time && thisEvent.details === details) {
				break;
			}
		}

		events.splice(i, 1);
		table.deleteRow(i+1);
	}
	
}

function exportData() {

	let data = JSON.stringify(events);
	let blob = new Blob([data], { type:"text/plain" });

	let link = document.createElement('a');
	link.style.display = "none";
	link.href = URL.createObjectURL(blob);
	link.download = "schedule_raw.txt";
	
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(link.href);
}

function processFileData(data) {
	wipeData();
	events = data;
	for(let i = 0; i < data.length; i++) {
		addRow(events[i], i+1);
	}
}

function importData() {
	const file = filesInput.files[0];
	
	if(file !== undefined) {

		let reader = new FileReader();
		reader.readAsText(file);

		var fileData = null;

		reader.onload = function(event) {

			try {
				fileData = JSON.parse(event.target.result);
				processFileData(fileData);
			} catch(error) {
				alert("The data in your file was not valid.");
				wipeData();
			}
			
		}
		
	} else {
		alert("You did not upload a file.");
	}
	
	
}

function safeWipeData() {
	let resp = confirm("Are you sure you would like to wipe to whole table?");

	if(resp) {
		wipeData();
	}
}

function wipeData() {

	let tempArr = Array.from(table.children[0].children);
	let toRemove = [];

	for(let i = 0; i < tempArr.length; i++) {
		if(!tempArr[i].classList.contains("setup")) {
			toRemove.push(tempArr[i]);
		}
	}

	for(let i = 0; i < toRemove.length; i++) {
		table.children[0].removeChild(toRemove[i]);
	}

	events = [];
}

function toStandard(time) {
	time = time.split(':');
	
	let hours = Number(time[0]);
	let minutes = Number(time[1]);

	let milTime;

	if (hours > 0 && hours <= 12) {
		milTime = "" + hours;
	} else if (hours > 12) {
	  	milTime = "" + (hours - 12);
	} else if (hours == 0) {
	  	milTime = "12";
	}

	milTime += (minutes < 10) ? ":0" + minutes : ":" + minutes;
	milTime += (hours >= 12) ? " P.M." : " A.M.";

	return milTime;
} // with help from https://rb.gy/g36q28

function toMilitary(time) {
	time = time.split(' ');
	const nums = time[0].split(':');
	const mod = time[1];

	let hours = (nums[0]);
	let minutes = (nums[1]);

	if(hours === '12') {
		hours = '00';
	}

	if(mod === 'P.M.') {
		hours = parseInt(hours) + 12;
	}

	if(parseInt(hours) < 10) {
		hours = `0${hours}`;
	}

	return `${hours}:${minutes}`;
} // with help from https://rb.gy/h14s06

function stringToHash(string) {

	let hash = 0;

	if (string.length == 0) return hash;

	for (i = 0; i < string.length; i++) {
		char = string.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}

	return hash;
} // with help from https://rb.gy/sdl887

addButton.addEventListener("click", addEvent);
removeAllButton.addEventListener("click", safeWipeData);
exportButton.addEventListener("click", exportData);
importButton.addEventListener("click", importData);
