# OpenLabor

OpenLabor is a free and open source dashboard designed to unify fragmented hourly labor data from disconnected sources. It's meant to save time and improve reporting accuracy by providing granular visibility into actual labor utilization and costs without the overhead of payroll software. 

It is primarily geared towards small business owners and team leads that may be dealing with multiple types of staffing. Retail, restaurants, cafes, thrift stores, coffee shops, event managers, local blue-collar firms, etc.

---

[openlabor-demo.webm](https://github.com/user-attachments/assets/6021515c-6c03-422c-9f03-d8220ee00693)

---

### Features

- Timesheets — Straightforward tracking and editing.
- Team Roster — Persistent database per browser instance with roles and individualized rates.
- P&L — Approximations of daily workday costs.
- Open Data — Export to JSON/CSV, or POST to a custom endpoint.
- Smart Math — Accurately calculates overnight and cross-day shifts.
- Convenience — A dedicated UX design replaces the friction of spreadsheets and pen-and-paper.

---

### Self-Hosting Setup

OpenLabor can be self-hosted and used offline.

To run the application, you will need [Node.js](https://nodejs.org/) installed on your machine.

```bash
git clone https://github.com/Garrett96/openlabor.git
cd openlabor-v2
```

`bash run.sh` on Linux/Mac.

Double-click `run.bat` on Windows.

The application is configured to run at `http://localhost:8070` to prevent conflicts with other local development servers.

---

### License

OpenLabor is released under the [Unlicense](https://unlicense.org/).
