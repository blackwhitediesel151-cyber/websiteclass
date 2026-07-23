(function () {
  "use strict";

  const visitor = [
    { id: "dashboard", title: "Dashboard", subtitle: "A quick look at today in CLASS SIX.", icon: "dashboard", href: "dashboard.html" },
    { id: "pengumuman", title: "Pengumuman", subtitle: "Latest class information and reminders.", icon: "bell", href: "pengumuman.html" },
    { id: "jadwal", title: "Jadwal", subtitle: "Weekly subjects, times, rooms, and dismissal.", icon: "clock", href: "jadwal.html" },
    { id: "mapel", title: "Mapel", subtitle: "Subjects, teachers, colors, and descriptions.", icon: "book", href: "mapel.html" },
    { id: "siswa", title: "Siswa", subtitle: "Class list with search and sorting.", icon: "students", href: "siswa.html" },
    { id: "guru", title: "Guru", subtitle: "Teacher profiles and subject assignments.", icon: "teachers", href: "guru.html" },
    { id: "organisasi", title: "Organisasi", subtitle: "Class organization structure and responsibilities.", icon: "org", href: "organisasi.html" },
    { id: "voting", title: "Voting", subtitle: "Vote once and see the live results.", icon: "vote", href: "voting.html" },
    { id: "kalender", title: "Kalender", subtitle: "Academic events, holidays, exams, and activities.", icon: "calendar", href: "kalender.html" },
    { id: "tentang", title: "Tentang", subtitle: "History, vision, mission, motto, and statistics.", icon: "info", href: "tentang.html" }
  ];

  const admin = [
    { id: "dashboard", title: "Dashboard", subtitle: "Administration overview for CLASS SIX.", icon: "dashboard", href: "dashboard.html" },
    { id: "pengumuman", title: "Pengumuman", subtitle: "Create, preview, pin, publish, and archive announcements.", icon: "bell", href: "pengumuman.html" },
    { id: "jadwal", title: "Jadwal", subtitle: "Manage weekly lessons and dismissal times.", icon: "clock", href: "jadwal.html" },
    { id: "mapel", title: "Mapel", subtitle: "Manage subjects, icons, colors, and teachers.", icon: "book", href: "mapel.html" },
    { id: "siswa", title: "Siswa", subtitle: "Add, edit, delete, import, and export students.", icon: "students", href: "siswa.html" },
    { id: "guru", title: "Guru", subtitle: "Manage teachers, subjects, positions, and profiles.", icon: "teachers", href: "guru.html" },
    { id: "organisasi", title: "Organisasi", subtitle: "Manage class positions and drag order.", icon: "org", href: "organisasi.html" },
    { id: "voting", title: "Voting", subtitle: "Build polls, activate voting, reset results, and preview.", icon: "vote", href: "voting.html" },
    { id: "kalender", title: "Kalender", subtitle: "Manage holidays, exams, events, and activity labels.", icon: "calendar", href: "kalender.html" },
    { id: "pengaturan", title: "Pengaturan", subtitle: "Website identity, theme, links, backup, and reset.", icon: "settings", href: "pengaturan.html" },
    { id: "backup", title: "Backup", subtitle: "Export, restore, import, and reset localStorage safely.", icon: "backup", href: "backup.html" }
  ];

  function get(area, id) {
    return (area === "admin" ? admin : visitor).find((item) => item.id === id);
  }

  window.ClassSixRoutes = { visitor, admin, get };
})();
