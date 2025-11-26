const dateRange = [
  { label: "Semua", range: undefined },
  {
    label: "Hari ini",
    range: {
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  },
  {
    label: "7 hari terakhir",
    range: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  },
  {
    label: "30 hari terakhir",
    range: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  },
  {
    label: "Bulan ini",
    range: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      ),
    },
  },
  {
    label: "Bulan lalu",
    range: {
      from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      to: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        0,
        23,
        59,
        59,
        999
      ),
    },
  },
];

export { dateRange };
