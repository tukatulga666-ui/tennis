const STORAGE_KEY = "courtClubDemo.v1";

const classOptions = [
    {
        id: "adult-beginner",
        name: "Насанд хүрэгчид · Анхан",
        level: "Суурь техник",
        days: ["Даваа", "Лхагва"],
        time: "19:00–20:30",
        location: "Төв талбай",
        venue: "ХУД · 15-р хороо",
        sessions: 8,
        duration: "90 минут",
        coach: "Бат-Эрдэнэ Наран",
        capacity: 8,
        price: "240,000₮"
    },
    {
        id: "junior-starter",
        name: "Хүүхэд · Анхан шат",
        level: "7–12 нас",
        days: ["Мягмар", "Пүрэв"],
        time: "16:30–18:00",
        location: "Зүүн талбай",
        venue: "БЗД · 26-р хороо",
        sessions: 12,
        duration: "90 минут",
        coach: "Саруул Одгэрэл",
        capacity: 10,
        price: "300,000₮"
    },
    {
        id: "adult-intermediate",
        name: "Насанд хүрэгчид · Ахисан",
        level: "Тактик, тоглолт",
        days: ["Бямба", "Ням"],
        time: "10:00–12:00",
        location: "Төв талбай",
        venue: "ХУД · 15-р хороо",
        sessions: 8,
        duration: "120 минут",
        coach: "Тэмүүлэн Мөнх",
        capacity: 6,
        price: "280,000₮"
    },
    {
        id: "private-coaching",
        name: "Ганцаарчилсан бэлтгэл",
        level: "Түвшинд тохируулна",
        days: ["Даваа", "Лхагва", "Баасан"],
        time: "Цаг тохирно",
        location: "Зүүн талбай",
        venue: "БЗД · 26-р хороо",
        sessions: 4,
        duration: "60 минут",
        coach: "Тэмүүлэн Мөнх",
        capacity: 1,
        price: "360,000₮"
    }
];

const demoStudent = {
    id: "demo-member",
    name: "Бат Болд",
    age: "16",
    phone: "9911 2233",
    email: "bold@example.com",
    classId: "adult-beginner",
    createdAt: "Демо бүртгэл"
};

function loadClubData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        const initial = { students: [demoStudent], attendance: {}, currentStudentId: demoStudent.id };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.students) || !parsed.attendance || typeof parsed.attendance !== "object") {
        throw new Error("Клубын demo мэдээллийн бүтэц буруу байна. Browser-ийн localStorage-г шалгана уу.");
    }
    return parsed;
}

let clubData = loadClubData();

function saveClubData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clubData));
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function renderClassCard(classInfo) {
    const enrolled = clubData.students.filter((student) => student.classId === classInfo.id).length;
    return `
        <article class="class-card">
            <div class="class-main">
                <span class="class-icon" aria-hidden="true">↗</span>
                <div><h3>${escapeHtml(classInfo.name)}</h3><p>${escapeHtml(classInfo.level)} · ${escapeHtml(classInfo.coach)}</p></div>
            </div>
            <div class="class-detail"><strong>${classInfo.days.map(escapeHtml).join(" · ")}</strong><small>${classInfo.sessions} удаагийн хөтөлбөр</small></div>
            <div class="class-detail"><strong>${escapeHtml(classInfo.time)}</strong><small>${escapeHtml(classInfo.location)} · ${escapeHtml(classInfo.venue)}</small></div>
            <div class="class-capacity"><b>${enrolled}/${classInfo.capacity}</b> хүн · ${escapeHtml(classInfo.price)}</div>
            <button class="class-join" type="button" data-class-id="${escapeHtml(classInfo.id)}">Сонгох ↗</button>
        </article>`;
}

function renderClasses() {
    const day = document.querySelector("#day-filter").value;
    const location = document.querySelector("#location-filter").value;
    const filtered = classOptions.filter((classInfo) =>
        (!day || classInfo.days.includes(day)) && (!location || classInfo.location === location)
    );

    document.querySelector("#class-list").innerHTML = filtered.map(renderClassCard).join("");
    document.querySelector("#results-count").textContent = `${filtered.length} анги`;
    document.querySelector("#no-results").hidden = filtered.length > 0;
}

function populateSelects() {
    const dayFilter = document.querySelector("#day-filter");
    const locationFilter = document.querySelector("#location-filter");
    const days = [...new Set(classOptions.flatMap((classInfo) => classInfo.days))];
    const locations = [...new Set(classOptions.map((classInfo) => classInfo.location))];

    dayFilter.insertAdjacentHTML("beforeend", days.map((day) => `<option value="${escapeHtml(day)}">${escapeHtml(day)}</option>`).join(""));
    locationFilter.insertAdjacentHTML("beforeend", locations.map((place) => `<option value="${escapeHtml(place)}">${escapeHtml(place)}</option>`).join(""));

    const options = classOptions.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} — ${item.days.map(escapeHtml).join(" · ")}, ${escapeHtml(item.time)}</option>`).join("");
    document.querySelector("#signup-class").innerHTML = `<option value="">Анги сонгоно уу</option>${options}`;
    document.querySelector("#profile-class").innerHTML = `<option value="">Анги сонгоно уу</option>${options}`;
    document.querySelector("#attendance-class").innerHTML = classOptions.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join("");
}

function selectedStudent() {
    return clubData.students.find((student) => student.id === clubData.currentStudentId) || clubData.students[clubData.students.length - 1] || null;
}

function renderStudentProfile() {
    const student = selectedStudent();
    const summary = document.querySelector("#student-summary");
    const form = document.querySelector("#profile-form");

    if (!student) {
        summary.innerHTML = 'Одоогоор бүртгэл алга. <a href="#signup">Сургалтад бүртгүүлэх ↗</a>';
        form.hidden = true;
        return;
    }

    form.hidden = false;
    form.elements.name.value = student.name;
    form.elements.age.value = student.age;
    form.elements.phone.value = student.phone;
    form.elements.email.value = student.email;
    form.elements.classId.value = student.classId || "";
    const enrolledClass = classOptions.find((item) => item.id === student.classId);
    summary.innerHTML = `<strong>${escapeHtml(student.name)}</strong> · ${escapeHtml(student.createdAt || "Бүртгэлтэй гишүүн")}<br>Сонгосон анги: <strong>${enrolledClass ? escapeHtml(enrolledClass.name) : "Анги сонгоогүй"}</strong>`;
}

function attendanceKey(classId, date, studentId) {
    return `${classId}|${date}|${studentId}`;
}

function renderAttendance() {
    const classId = document.querySelector("#attendance-class").value;
    const date = document.querySelector("#attendance-date").value;
    const attendees = clubData.students.filter((student) => student.classId === classId);
    const container = document.querySelector("#attendance-list");

    if (!date) {
        container.innerHTML = '<p class="no-results">Ирц харахын тулд хичээлийн өдрөө сонгоно уу.</p>';
        return;
    }
    if (attendees.length === 0) {
        container.innerHTML = '<p class="no-results">Энэ ангид бүртгэлтэй суралцагч одоогоор алга.</p>';
        return;
    }

    container.innerHTML = attendees.map((student) => {
        const present = clubData.attendance[attendanceKey(classId, date, student.id)] === true;
        return `<div class="attendance-row">
            <div class="attendee-info"><strong>${escapeHtml(student.name)}</strong><span>${escapeHtml(student.phone)} · ${escapeHtml(student.email)}</span></div>
            <div class="attendance-actions" aria-label="${escapeHtml(student.name)} ирц">
                <button class="attendance-button ${present ? "is-present" : ""}" type="button" data-student-id="${escapeHtml(student.id)}" data-present="true" aria-pressed="${present}">✓ Ирсэн</button>
                <button class="attendance-button ${!present ? "is-absent" : ""}" type="button" data-student-id="${escapeHtml(student.id)}" data-present="false" aria-pressed="${!present}">— Ирээгүй</button>
            </div>
        </div>`;
    }).join("");
}

function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle("is-error", isError);
}

function setPortalTab(tab) {
    const isStudent = tab === "student";
    document.querySelector("#student-tab").classList.toggle("is-active", isStudent);
    document.querySelector("#coach-tab").classList.toggle("is-active", !isStudent);
    document.querySelector("#student-tab").setAttribute("aria-selected", String(isStudent));
    document.querySelector("#coach-tab").setAttribute("aria-selected", String(!isStudent));
    document.querySelector("#student-panel").hidden = !isStudent;
    document.querySelector("#coach-panel").hidden = isStudent;
    if (!isStudent) renderAttendance();
}

const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Цэс хаах" : "Цэс нээх");
    navLinks.classList.toggle("is-open", open);
});
navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Цэс нээх");
        navLinks.classList.remove("is-open");
    }
});

populateSelects();
renderClasses();
renderStudentProfile();
document.querySelector("#year").textContent = new Date().getFullYear();

document.querySelector("#day-filter").addEventListener("change", renderClasses);
document.querySelector("#location-filter").addEventListener("change", renderClasses);
document.querySelector("#class-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-class-id]");
    if (!button) return;
    document.querySelector("#signup-class").value = button.dataset.classId;
    document.querySelector("#signup").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#signup-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const chosenClass = classOptions.find((item) => item.id === values.classId);
    const message = document.querySelector("#signup-message");

    if (!chosenClass) {
        showMessage(message, "Сургалтын ангиа сонгоно уу.", true);
        return;
    }
    if (clubData.students.some((student) => student.phone === values.phone.trim())) {
        showMessage(message, "Энэ утасны дугаараар бүртгэл байна. Профайлаасаа мэдээллээ шинэчилнэ үү.", true);
        return;
    }

    const student = {
        id: `member-${Date.now()}`,
        name: values.name.trim(),
        age: values.age,
        phone: values.phone.trim(),
        email: values.email.trim(),
        classId: values.classId,
        createdAt: new Date().toLocaleDateString("mn-MN")
    };
    clubData.students.push(student);
    clubData.currentStudentId = student.id;
    saveClubData();
    form.reset();
    renderClasses();
    renderStudentProfile();
    renderAttendance();
    showMessage(message, "Бүртгэл амжилттай хадгалагдлаа. Таны мэдээлэл «Миний булан»-д нээгдлээ.");
});

document.querySelector("#profile-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const student = selectedStudent();
    if (!student) return;
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const duplicate = clubData.students.some((item) => item.id !== student.id && item.phone === values.phone.trim());
    if (duplicate) {
        showMessage(document.querySelector("#profile-message"), "Энэ утасны дугаар өөр гишүүний бүртгэлд ашиглагдаж байна.", true);
        return;
    }

    Object.assign(student, {
        name: values.name.trim(),
        age: values.age,
        phone: values.phone.trim(),
        email: values.email.trim(),
        classId: values.classId
    });
    saveClubData();
    renderStudentProfile();
    renderClasses();
    renderAttendance();
    showMessage(document.querySelector("#profile-message"), "Мэдээлэл амжилттай шинэчлэгдлээ.");
});

document.querySelector("#student-tab").addEventListener("click", () => setPortalTab("student"));
document.querySelector("#coach-tab").addEventListener("click", () => setPortalTab("coach"));
document.querySelector("#attendance-class").addEventListener("change", renderAttendance);

function getLocalDate() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

document.querySelector("#attendance-date").value = getLocalDate();
document.querySelector("#attendance-date").addEventListener("change", renderAttendance);
document.querySelector("#attendance-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-student-id]");
    if (!button) return;
    const key = attendanceKey(
        document.querySelector("#attendance-class").value,
        document.querySelector("#attendance-date").value,
        button.dataset.studentId
    );
    clubData.attendance[key] = button.dataset.present === "true";
    saveClubData();
    renderAttendance();
});
