(function () {
  "use strict";

  const Utils = window.ClassSixUtils;
  const KEY = "classSix.state.v1";
  const AUTH_KEY = "classSix.admin.session";
  const VOTE_KEY = "classSix.visitor.votes";

  const defaultStudents = [
    { id: "stu-001", number: 1, name: "Adel Fathika Putri", avatar: "", note: "Student of Class Six" },
    { id: "stu-002", number: 2, name: "Agrista Berlin Libania", avatar: "", note: "Student of Class Six" },
    { id: "stu-003", number: 3, name: "Dzaky Almahir Jamil", avatar: "", note: "Student of Class Six" },
    { id: "stu-004", number: 4, name: "Earlyta Arsyfa Salsabila", avatar: "", note: "Student of Class Six" },
    { id: "stu-005", number: 5, name: "Finna Zulima Khairani", avatar: "", note: "Student of Class Six" },
    { id: "stu-006", number: 6, name: "Kirana Maulidda", avatar: "", note: "Student of Class Six" },
    { id: "stu-007", number: 7, name: "Mirza Fajar Nailun Nabkhan", avatar: "", note: "Student of Class Six" },
    { id: "stu-008", number: 8, name: "Muhammad Naufal Assegaf", avatar: "", note: "Student of Class Six" },
    { id: "stu-009", number: 9, name: "Muhammad Andika Pratama", avatar: "", note: "Student of Class Six" },
    { id: "stu-010", number: 10, name: "Muhammad Rafa Azka", avatar: "", note: "Student of Class Six" },
    { id: "stu-011", number: 11, name: "Muhammad Raihan Al Haidar", avatar: "", note: "Student of Class Six" },
    { id: "stu-012", number: 12, name: "Muhammad Rizky Saputra", avatar: "", note: "Student of Class Six" },
    { id: "stu-013", number: 13, name: "Muhammad Zulfikar Putra Pratama", avatar: "", note: "Student of Class Six" },
    { id: "stu-014", number: 14, name: "Safira Azkya", avatar: "", note: "Student of Class Six" },
    { id: "stu-015", number: 15, name: "Sarfaraz Imtiaz Hakmi", avatar: "", note: "Student of Class Six" },
    { id: "stu-016", number: 16, name: "Tasya Kamila", avatar: "", note: "Student of Class Six" }
  ];

  const defaultTeachers = [
    { id: "tch-001", name: "Ibu Nadia Prameswari", subject: "Mathematics", position: "Wali Kelas", avatar: "", bio: "Guides numeracy, discipline, and daily class coordination." },
    { id: "tch-002", name: "Pak Arman Santoso", subject: "IPAS", position: "Guru Mapel", avatar: "", bio: "Connects science concepts with daily observation projects." },
    { id: "tch-003", name: "Ibu Lestari Widya", subject: "Bahasa Indonesia", position: "Guru Mapel", avatar: "", bio: "Builds reading, writing, and presentation confidence." },
    { id: "tch-004", name: "Pak Yusuf Hidayat", subject: "PAI", position: "Guru Mapel", avatar: "", bio: "Leads character learning and religious literacy." },
    { id: "tch-005", name: "Ibu Rani Permata", subject: "Seni Budaya", position: "Pembina Kreatif", avatar: "", bio: "Mentors visual art, music, and class performance activities." },
    { id: "tch-006", name: "Pak Bagus Wicaksono", subject: "PJOK", position: "Guru Mapel", avatar: "", bio: "Keeps movement, teamwork, and healthy habits active." },
    { id: "tch-007", name: "Ibu Maya Kusuma", subject: "Bahasa Inggris", position: "Guru Mapel", avatar: "", bio: "Practices everyday English through games and short speaking tasks." },
    { id: "tch-008", name: "Pak Dimas Prakoso", subject: "Komputer", position: "Guru TIK", avatar: "", bio: "Introduces safe, creative, and productive technology use." }
  ];

  const defaultSubjects = [
    { id: "sub-001", name: "Mathematics", icon: "calculator", color: "#2563eb", teacher: "Ibu Nadia Prameswari", description: "Numbers, geometry, problem solving, and mathematical reasoning." },
    { id: "sub-002", name: "IPAS", icon: "leaf", color: "#0f9f6e", teacher: "Pak Arman Santoso", description: "Science and social studies through observation and inquiry." },
    { id: "sub-003", name: "Seni Budaya", icon: "palette", color: "#d97706", teacher: "Ibu Rani Permata", description: "Creative expression through art, music, craft, and performance." },
    { id: "sub-004", name: "Bahasa Indonesia", icon: "book", color: "#7c3aed", teacher: "Ibu Lestari Widya", description: "Reading, writing, speaking, listening, and literature appreciation." },
    { id: "sub-005", name: "PAI", icon: "star", color: "#0891b2", teacher: "Pak Yusuf Hidayat", description: "Faith, worship practice, moral values, and daily character." },
    { id: "sub-006", name: "PJOK", icon: "activity", color: "#dc2626", teacher: "Pak Bagus Wicaksono", description: "Physical education, teamwork, endurance, and healthy lifestyle." },
    { id: "sub-007", name: "Bahasa Jawa", icon: "message", color: "#b45309", teacher: "Ibu Lestari Widya", description: "Local language, manners, vocabulary, and cultural literacy." },
    { id: "sub-008", name: "Pancasila", icon: "shield", color: "#1d4ed8", teacher: "Ibu Nadia Prameswari", description: "Citizenship, values, class discussion, and civic projects." },
    { id: "sub-009", name: "Komputer", icon: "monitor", color: "#0d9488", teacher: "Pak Dimas Prakoso", description: "Digital basics, typing, safety, and creative productivity." },
    { id: "sub-010", name: "Bahasa Inggris", icon: "globe", color: "#9333ea", teacher: "Ibu Maya Kusuma", description: "Vocabulary, simple grammar, listening, and speaking practice." }
  ];

  const defaultSchedule = [
    { id: "sch-001", day: "Senin", dayKey: "monday", start: "07:00", end: "08:20", subject: "Mathematics", teacher: "Ibu Nadia Prameswari", room: "Kelas VI", dismissal: "12.10 WIB" },
    { id: "sch-002", day: "Senin", dayKey: "monday", start: "08:35", end: "10:00", subject: "IPAS", teacher: "Pak Arman Santoso", room: "Kelas VI", dismissal: "12.10 WIB" },
    { id: "sch-003", day: "Senin", dayKey: "monday", start: "10:20", end: "12:10", subject: "Seni Budaya", teacher: "Ibu Rani Permata", room: "Studio Mini", dismissal: "12.10 WIB" },
    { id: "sch-004", day: "Selasa", dayKey: "tuesday", start: "07:00", end: "08:20", subject: "Mathematics", teacher: "Ibu Nadia Prameswari", room: "Kelas VI", dismissal: "12.10 WIB" },
    { id: "sch-005", day: "Selasa", dayKey: "tuesday", start: "08:35", end: "10:00", subject: "Bahasa Indonesia", teacher: "Ibu Lestari Widya", room: "Kelas VI", dismissal: "12.10 WIB" },
    { id: "sch-006", day: "Selasa", dayKey: "tuesday", start: "10:20", end: "12:10", subject: "PAI", teacher: "Pak Yusuf Hidayat", room: "Kelas VI", dismissal: "12.10 WIB" },
    { id: "sch-007", day: "Rabu", dayKey: "wednesday", start: "07:00", end: "08:20", subject: "PJOK", teacher: "Pak Bagus Wicaksono", room: "Lapangan", dismissal: "12.10 WIB" },
    { id: "sch-008", day: "Rabu", dayKey: "wednesday", start: "08:35", end: "10:00", subject: "PAI", teacher: "Pak Yusuf Hidayat", room: "Kelas VI", dismissal: "12.10 WIB" },
    { id: "sch-009", day: "Rabu", dayKey: "wednesday", start: "10:20", end: "12:10", subject: "Bahasa Indonesia", teacher: "Ibu Lestari Widya", room: "Kelas VI", dismissal: "12.10 WIB" },
    { id: "sch-010", day: "Kamis", dayKey: "thursday", start: "07:00", end: "08:20", subject: "Bahasa Indonesia", teacher: "Ibu Lestari Widya", room: "Kelas VI", dismissal: "12.10 WIB" },
    { id: "sch-011", day: "Kamis", dayKey: "thursday", start: "08:35", end: "10:00", subject: "Bahasa Jawa", teacher: "Ibu Lestari Widya", room: "Kelas VI", dismissal: "12.10 WIB" },
    { id: "sch-012", day: "Kamis", dayKey: "thursday", start: "10:20", end: "12:10", subject: "Pancasila", teacher: "Ibu Nadia Prameswari", room: "Kelas VI", dismissal: "12.10 WIB" },
    { id: "sch-013", day: "Jumat", dayKey: "friday", start: "07:00", end: "08:20", subject: "IPAS", teacher: "Pak Arman Santoso", room: "Kelas VI", dismissal: "10.10 WIB" },
    { id: "sch-014", day: "Jumat", dayKey: "friday", start: "08:35", end: "10:10", subject: "Komputer", teacher: "Pak Dimas Prakoso", room: "Lab Komputer", dismissal: "10.10 WIB" },
    { id: "sch-015", day: "Sabtu", dayKey: "saturday", start: "07:00", end: "08:00", subject: "Mathematics", teacher: "Ibu Nadia Prameswari", room: "Kelas VI", dismissal: "10.10 WIB" },
    { id: "sch-016", day: "Sabtu", dayKey: "saturday", start: "08:05", end: "09:05", subject: "Bahasa Inggris", teacher: "Ibu Maya Kusuma", room: "Kelas VI", dismissal: "10.10 WIB" },
    { id: "sch-017", day: "Sabtu", dayKey: "saturday", start: "09:10", end: "10:10", subject: "Pancasila", teacher: "Ibu Nadia Prameswari", room: "Kelas VI", dismissal: "10.10 WIB" }
  ];

  const defaultOrganization = [
    { id: "org-001", position: "Ketua Kelas", name: "Muhammad Naufal Assegaf", photo: "", order: 1, description: "Coordinates class discussion and represents student voice." },
    { id: "org-002", position: "Wakil Ketua", name: "Safira Azkya", photo: "", order: 2, description: "Supports class leadership and daily coordination." },
    { id: "org-003", position: "Sekretaris", name: "Kirana Maulidda", photo: "", order: 3, description: "Keeps class notes, minutes, and written reminders organized." },
    { id: "org-004", position: "Bendahara", name: "Muhammad Rizky Saputra", photo: "", order: 4, description: "Manages class contribution records transparently." },
    { id: "org-005", position: "Koordinator Kebersihan", name: "Adel Fathika Putri", photo: "", order: 5, description: "Keeps cleaning duties fair, clear, and consistent." },
    { id: "org-006", position: "Koordinator Kreatif", name: "Dzaky Almahir Jamil", photo: "", order: 6, description: "Helps prepare class displays, events, and creative projects." }
  ];

  const defaultCalendar = [
    { id: "cal-001", title: "Class Project Exhibition", date: "2026-07-28", type: "School Activity", color: "#2563eb", description: "Students present small group projects to the class." },
    { id: "cal-002", title: "Mathematics Daily Test", date: "2026-08-05", type: "Exam", color: "#dc2626", description: "Daily assessment for fractions and geometry review." },
    { id: "cal-003", title: "Independence Day Preparation", date: "2026-08-15", type: "School Activity", color: "#0f9f6e", description: "Class decoration and practice for school celebration." },
    { id: "cal-004", title: "Independence Day Holiday", date: "2026-08-17", type: "Holiday", color: "#d97706", description: "National holiday." },
    { id: "cal-005", title: "Mid-Semester Assessment", date: "2026-09-14", type: "Exam", color: "#7c3aed", description: "First day of mid-semester assessment week." }
  ];

  const defaultState = {
    version: 1,
    settings: {
      websiteName: "CLASS SIX",
      className: "Class Six",
      logo: "",
      favicon: "",
      tiktok: "https://www.tiktok.com/",
      footerText: "CLASS SIX classroom portal. Built as a static frontend portfolio project.",
      themeColor: "#2563eb",
      darkMode: false,
      history: "CLASS SIX is a compact classroom portal created to keep class information clear, friendly, and easy to update.",
      vision: "A confident, disciplined, creative class that learns with curiosity and kindness.",
      mission: "Keep learning organized, support every student, celebrate progress, and make class activities transparent.",
      motto: "Learn together, grow together."
    },
    announcements: [
      { id: "ann-001", title: "Welcome to CLASS SIX", category: "General", date: "2026-07-23", status: "Published", pinned: true, body: "Welcome to the official CLASS SIX classroom portal. Use this website to check announcements, schedule, students, teachers, voting, and academic activities." },
      { id: "ann-002", title: "Bring Art Supplies on Monday", category: "Reminder", date: "2026-07-24", status: "Published", pinned: false, body: "Please bring colored pencils, scissors, glue, and one recycled cardboard sheet for Seni Budaya activity." },
      { id: "ann-003", title: "Mathematics Practice Sheet", category: "Academic", date: "2026-07-25", status: "Draft", pinned: false, body: "Practice sheet draft for multiplication and fraction review. Publish after teacher approval." }
    ],
    students: defaultStudents,
    teachers: defaultTeachers,
    subjects: defaultSubjects,
    schedule: defaultSchedule,
    organization: defaultOrganization,
    calendar: defaultCalendar,
    voting: [
      { id: "vote-001", title: "Choose Next Class Activity", description: "Vote for the next class activity after the project exhibition.", status: "Active", createdAt: "2026-07-23", options: [
        { id: "opt-001", label: "Science mini experiment", votes: 7 },
        { id: "opt-002", label: "Reading corner refresh", votes: 4 },
        { id: "opt-003", label: "Math challenge day", votes: 5 }
      ] }
    ],
    activity: [
      { id: "act-001", text: "Portal initialized with real Class Six data.", time: "2026-07-23T08:00:00.000Z" },
      { id: "act-002", text: "Voting opened: Choose Next Class Activity.", time: "2026-07-23T08:30:00.000Z" }
    ]
  };

  const dataFiles = {
    students: "siswa.json",
    teachers: "guru.json",
    subjects: "mapel.json",
    schedule: "jadwal.json",
    organization: "organisasi.json",
    calendar: "kalender.json"
  };

  let state = null;

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("Unable to read localStorage", error);
      return state;
    }
  }

  function write(nextState) {
    state = nextState;
    try {
      localStorage.setItem(KEY, JSON.stringify(nextState));
    } catch (error) {
      console.warn("Unable to write localStorage", error);
    }
    return state;
  }

  function withRequiredShape(value) {
    const seed = Utils.clone(defaultState);
    const next = Object.assign(seed, value || {});
    next.settings = Object.assign(seed.settings, value && value.settings ? value.settings : {});
    ["announcements", "students", "teachers", "subjects", "schedule", "organization", "calendar", "voting", "activity"].forEach((key) => {
      if (!Array.isArray(next[key])) next[key] = seed[key];
    });
    return next;
  }

  async function fetchJsonDefaults(seed) {
    const base = `${Utils.assetBase()}data/`;
    const next = Utils.clone(seed);

    async function load(url) {
      const response = await fetch(url, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Cannot load ${url} (${response.status})`);
      }

      const type = response.headers.get("content-type") || "";
      if (!type.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          `Expected JSON but received:\n${text.substring(0,120)}`
        );
      }

      return response.json();
    }

    try {
      const defaults = await load(`${base}default.json`);
      Object.assign(next, defaults);
      next.settings = {
        ...seed.settings,
        ...(defaults.settings || {})
      };
    } catch (e) {
      console.error(e);
    }

    for (const [key, file] of Object.entries(dataFiles)) {
      try {
        next[key] = await load(`${base}${file}`);
      } catch (e) {
        console.error(e);
      }
    }

    return withRequiredShape(next);
  }

  async function init() {
    const existing = read();
    if (existing) {
      state = withRequiredShape(existing);
      write(state);
      return state;
    }
    const seed = Utils.clone(defaultState);
    try {
      state = await fetchJsonDefaults(seed);
    } catch (error) {
      state = seed;
    }
    write(state);
    return state;
  }

  function getState() {
    if (!state) state = withRequiredShape(read() || defaultState);
    return state;
  }

  function setState(nextState, activityText) {
    const next = withRequiredShape(nextState);
    if (activityText) {
      next.activity = [{ id: Utils.uid("act"), text: activityText, time: new Date().toISOString() }].concat(next.activity || []).slice(0, 30);
    }
    return write(next);
  }

  function collection(key) {
    return Utils.clone(getState()[key] || []);
  }

  function saveCollection(key, value, activityText) {
    const next = getState();
    next[key] = Utils.clone(value);
    return setState(next, activityText);
  }

  function settings() {
    return Utils.clone(getState().settings);
  }

  function saveSettings(value, activityText) {
    const next = getState();
    next.settings = Object.assign({}, next.settings, value);
    return setState(next, activityText || "Website settings updated.");
  }

  function resetAll() {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(VOTE_KEY);
    } catch (error) {
      console.warn("Unable to reset localStorage", error);
    }
    state = Utils.clone(defaultState);
    write(state);
    return state;
  }

  function exportState() {
    return JSON.stringify(getState(), null, 2);
  }

  function importState(raw) {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return setState(withRequiredShape(parsed), "Website data restored from backup.");
  }

  function isAuthed() {
    return localStorage.getItem(AUTH_KEY) === "true";
  }

  function login(password) {
    if (password === "admin123") {
      localStorage.setItem(AUTH_KEY, "true");
      return true;
    }
    return false;
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
  }

  function votes() {
    return JSON.parse(localStorage.getItem(VOTE_KEY) || "{}");
  }

  function hasVoted(voteId) {
    return Boolean(votes()[voteId]);
  }

  function recordVote(voteId, optionId) {
    const nextVotes = votes();
    nextVotes[voteId] = optionId;
    localStorage.setItem(VOTE_KEY, JSON.stringify(nextVotes));
  }

  function clearVotes(voteId) {
    const nextVotes = votes();
    if (voteId) delete nextVotes[voteId];
    else Object.keys(nextVotes).forEach((key) => delete nextVotes[key]);
    localStorage.setItem(VOTE_KEY, JSON.stringify(nextVotes));
  }

  window.ClassSixStorage = {
    AUTH_KEY,
    VOTE_KEY,
    collection,
    clearVotes,
    defaultState,
    exportState,
    getState,
    hasVoted,
    importState,
    init,
    isAuthed,
    login,
    logout,
    recordVote,
    resetAll,
    saveCollection,
    saveSettings,
    setState,
    settings,
    votes
  };
})();
