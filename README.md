# Relate – Personal CRM
**Relate** is a beautifully designed, minimalist personal CRM built to help you manage relationships, track interactions, and stay in touch with your network. It features an award-winning, editorial luxury aesthetic inspired by high-end architectural visualization studios.

---

## 🎨 Design Philosophy
The design of Relate is a complete departure from generic dashboards. It embraces a strict monochromatic "Bloom3D" aesthetic:
- **Pure Black Canvas** (`#0a0a0a`)
- **Warm Cream Typography** (`#f0ebe0`)
- **Editorial Typography**: `Cormorant Garamond` (display) and `DM Sans` (body)
- **Minimalist Elements**: Hairline borders, no heavy shadows, and subtle hover animations.

---

## 📸 Screenshots
### 1. Login Screen
<img width="1680" height="960" alt="Screenshot 2026-07-22 at 6 03 44 PM" src="https://github.com/user-attachments/assets/f23257cd-44a1-460d-ad9a-d67772f92b97" />

### 2. Dashboard
*(Overview of overdue follow-ups, recent interactions, and total contacts.)*
<img width="1680" height="958" alt="Screenshot 2026-07-22 at 6 05 58 PM" src="https://github.com/user-attachments/assets/4f291bfc-e876-4e20-b0b3-b409ede15957" />


### 3. Contacts List
*(A clean, gap-less grid of monogram cards representing your network.)*
<img width="1680" height="959" alt="Screenshot 2026-07-22 at 6 12 13 PM" src="https://github.com/user-attachments/assets/1e1802fd-8b84-468b-a051-391a99e9deb0" />

### 4. Contact Profile
*(Detailed view of a contact with an interaction logging form and a timeline of past activity.)*
<img width="1680" height="959" alt="Screenshot 2026-07-22 at 6 05 42 PM" src="https://github.com/user-attachments/assets/1ac8bad0-1d80-4961-afbe-d689a9b2c621" />


---

## ✨ Features
- **Dashboard Overview**: See who needs follow-up and view a timeline of recent activity.
- **Contact Management**: Add people to your network with contact details, tags, and custom follow-up intervals.
- **Interaction Tracking**: Log calls, emails, meetings, and coffees with detailed notes.
- **Automated Reminders**: Never lose touch. Relate automatically calculates when a contact is overdue based on their specified interval.
- **Authentication**: Secure login and registration powered by JWT.

---

## 🛠️ Tech Stack
This project is built as a monorepo using **npm workspaces**:

- **Frontend (`@crm/client`)**: React, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form, Zod.
- **Backend (`@crm/server`)**: Node.js, Express, TypeScript, Prisma (ORM), SQLite (Database), JSON Web Tokens (JWT).
- **Shared (`@crm/shared`)**: Shared Zod schemas and TypeScript types.
- **Deployment**: Dockerized setup with a multi-stage Nginx build for the client and a Node.js container for the server, orchestrated via `docker-compose`.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the Database (Prisma):**
   ```bash
   cd apps/server
   npx prisma generate
   npx prisma db push
   ```

3. **Environment Variables:**
   Create a `.env` file in `apps/server` (you can use `.env.example` if available) and ensure `JWT_SECRET` and `DATABASE_URL` are set.
   ```env
   JWT_SECRET=super_secret_key
   PORT=3000
   DATABASE_URL="file:./dev.db"
   ```

4. **Run the Development Servers:**
   From the root of the project, run:
   ```bash
   npm run dev --workspaces
   ```
   - The backend will start on `http://localhost:3000`
   - The frontend will start on `http://localhost:5173` (or `5174`)

---

## 🐳 Deployment (Docker)
To run the production build using Docker:

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```
The application will be accessible at `http://localhost:80` (Client) and `http://localhost:3000` (API).
