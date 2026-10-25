import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Plus, Edit2, Trash2, Save, CheckCircle2, Circle, ChevronLeft, ChevronRight, Shuffle, Calendar } from 'lucide-react';
import AppShell from '@/components/app/AppShell';

// ── 50 Unique Affirmation Quotes ──────────────────────────────────────────────
const AFFIRMATIONS = [
{ quote: '"The secret of getting ahead is getting started."', author: 'Mark Twain', text: "I am capable. I am consistent. Today I choose to study, to grow, and to become the topnotcher I was born to be." },
{ quote: '"Success is the sum of small efforts, repeated day in and day out."', author: 'Robert Collier', text: 'Every page I read, every question I answer, every hour I study — it all adds up. I am building my future one day at a time. 💪' },
{ quote: '"Believe you can and you\'re halfway there."', author: 'Theodore Roosevelt', text: 'I believe in my preparation. I trust my process. The board exam is not my enemy — it is my stage. 🌟' },
{ quote: '"It always seems impossible until it\'s done."', author: 'Nelson Mandela', text: 'The topnotcher list has my name on it. I just have to show up today, and every day after. 🎯' },
{ quote: '"Hard work beats talent when talent doesn\'t work hard."', author: 'Tim Notke', text: 'I may not be the smartest in the room, but I will be the most prepared. Discipline is my superpower. 🔥' },
{ quote: '"The future belongs to those who believe in the beauty of their dreams."', author: 'Eleanor Roosevelt', text: 'My dream of becoming a licensed psychometrician is valid, achievable, and worth every sacrifice. ✨' },
{ quote: '"Don\'t watch the clock; do what it does. Keep going."', author: 'Sam Levenson', text: 'One more chapter. One more set of questions. One more hour closer to my goal. I keep going. ⏰' },
{ quote: '"You don\'t have to be great to start, but you have to start to be great."', author: 'Zig Ziglar', text: 'Today\'s imperfect study session is better than yesterday\'s perfect excuse. I start, and I keep going. 📖' },
{ quote: '"The only way to do great work is to love what you do."', author: 'Steve Jobs', text: 'I love psychology. I love learning. And I love the person I am becoming through this journey. 💙' },
{ quote: '"Success usually comes to those who are too busy to be looking for it."', author: 'Henry David Thoreau', text: 'I am too focused on my goals to be distracted by doubt. I study. I grow. I succeed. 🚀' },
{ quote: '"The harder I work, the luckier I get."', author: 'Samuel Goldwyn', text: 'Luck is preparation meeting opportunity. I am preparing every single day for my moment. 🍀' },
{ quote: '"Opportunities don\'t happen. You create them."', author: 'Chris Grosser', text: 'I create my own path to the topnotcher list. Every study session is a step I choose to take. 🛤️' },
{ quote: '"It does not matter how slowly you go as long as you do not stop."', author: 'Confucius', text: 'My pace is my own. My progress is real. I will not stop until I cross that finish line. 🏁' },
{ quote: '"In the middle of every difficulty lies opportunity."', author: 'Albert Einstein', text: 'The hard topics are where I grow the most. I embrace the challenge because it makes me stronger. 💡' },
{ quote: '"The expert in anything was once a beginner."', author: 'Helen Hayes', text: 'I was once confused by these concepts. Now I understand them. Tomorrow I will master them. 🎓' },
{ quote: '"Push yourself, because no one else is going to do it for you."', author: 'Unknown', text: 'No one can study for me. No one can take the exam for me. This is my journey, and I own it. 💪' },
{ quote: '"Great things never come from comfort zones."', author: 'Unknown', text: 'I choose discomfort today so I can celebrate victory tomorrow. Growth lives outside my comfort zone. 🌱' },
{ quote: '"Dream it. Wish it. Do it."', author: 'Unknown', text: 'I do not just dream of passing the PMLE. I study for it. I prepare for it. I will achieve it. 🌠' },
{ quote: '"The only limit to our realization of tomorrow is our doubts of today."', author: 'Franklin D. Roosevelt', text: 'I release my doubts and replace them with action. Today\'s study session is proof of my commitment. 🌅' },
{ quote: '"What you get by achieving your goals is not as important as what you become."', author: 'Henry David Thoreau', text: 'The PMLE is not just a license — it is proof of who I have become through 100 days of discipline. 🏆' },
{ quote: '"Strive not to be a success, but rather to be of value."', author: 'Albert Einstein', text: 'I study not just to pass, but to become a psychometrician who truly helps people. That is my purpose. 🌍' },
{ quote: '"I find that the harder I work, the more luck I seem to have."', author: 'Thomas Jefferson', text: 'Every hour I log is an investment in my future. Hard work creates its own luck. 🎲' },
{ quote: '"The secret to success is to know something nobody else knows."', author: 'Aristotle Onassis', text: 'I study deeply, not just broadly. I understand the why behind every concept. That is my edge. 🧠' },
{ quote: '"Success is not the key to happiness. Happiness is the key to success."', author: 'Albert Schweitzer', text: 'I find joy in learning. I celebrate small wins. I am happy on this journey, not just at the destination. 😊' },
{ quote: '"The best time to plant a tree was 20 years ago. The second best time is now."', author: 'Chinese Proverb', text: 'I cannot change yesterday\'s missed study session. But I can make today count. I start now. 🌳' },
{ quote: '"An investment in knowledge pays the best interest."', author: 'Benjamin Franklin', text: 'Every hour I invest in studying psychology pays dividends for the rest of my career. I invest wisely. 📈' },
{ quote: '"Education is the most powerful weapon which you can use to change the world."', author: 'Nelson Mandela', text: 'My license is not just for me — it is for every client I will help, every life I will touch. I study for them too. 🌏' },
{ quote: '"The beautiful thing about learning is that no one can take it away from you."', author: 'B.B. King', text: 'Every concept I master is mine forever. No one can take my knowledge away. I am building something permanent. 📚' },
{ quote: '"Develop a passion for learning. If you do, you will never cease to grow."', author: 'Anthony J. D\'Angelo', text: 'I am not just studying for an exam. I am falling in love with psychology. And that love will carry me through. ❤️' },
{ quote: '"The more that you read, the more things you will know."', author: 'Dr. Seuss', text: 'Every chapter I read expands my world. Every concept I learn makes me a better future psychometrician. 📖' },
{ quote: '"Live as if you were to die tomorrow. Learn as if you were to live forever."', author: 'Mahatma Gandhi', text: 'I study with urgency and with depth. The PMLE is coming — and I will be ready. 🕊️' },
{ quote: '"The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."', author: 'Brian Herbert', text: 'I choose to learn today. I choose to grow. I choose to become the psychometrician I was meant to be. 🎁' },
{ quote: '"Tell me and I forget. Teach me and I remember. Involve me and I learn."', author: 'Benjamin Franklin', text: 'I do not just read — I engage, I practice, I apply. Active learning is my strategy for the PMLE. 🤝' },
{ quote: '"The mind is not a vessel to be filled, but a fire to be kindled."', author: 'Plutarch', text: 'My curiosity about psychology is a fire. Every study session adds fuel. I am burning bright. 🔥' },
{ quote: '"Learning is not attained by chance; it must be sought for with ardor and attended to with diligence."', author: 'Abigail Adams', text: 'I seek knowledge with passion and pursue it with discipline. The PMLE will not catch me unprepared. 🎯' },
{ quote: '"The roots of education are bitter, but the fruit is sweet."', author: 'Aristotle', text: 'The long study hours are the bitter roots. The license, the career, the impact — those are the sweet fruit. 🍎' },
{ quote: '"Education is not preparation for life; education is life itself."', author: 'John Dewey', text: 'This review journey is not just preparation — it is shaping who I am becoming. I embrace every moment of it. 🌟' },
{ quote: '"The more I read, the more I acquire, the more certain I am that I know nothing."', author: 'Voltaire', text: 'Humility keeps me hungry. The more I learn, the more I want to learn. That hunger will carry me to the top. 🌊' },
{ quote: '"Real learning comes about when the competitive spirit has ceased."', author: 'Jiddu Krishnamurti', text: 'I study for mastery, not just to beat others. When I master the material, the ranking takes care of itself. 🧘' },
{ quote: '"Anyone who stops learning is old, whether at twenty or eighty."', author: 'Henry Ford', text: 'I am young in my learning journey. I stay curious, stay hungry, stay growing. Age is just a number. 🌱' },
{ quote: '"The whole purpose of education is to turn mirrors into windows."', author: 'Sydney J. Harris', text: 'Psychology has turned my mirror outward — I now see the world through the lens of human behavior. That is my gift. 🪟' },
{ quote: '"Education is the passport to the future, for tomorrow belongs to those who prepare for it today."', author: 'Malcolm X', text: 'My preparation today is my passport to the future I want. I am preparing. I am ready. 🛂' },
{ quote: '"The function of education is to teach one to think intensively and to think critically."', author: 'Martin Luther King Jr.', text: 'I do not just memorize — I think critically about every concept. That is how I will ace the PMLE. 🧩' },
{ quote: '"Wisdom is not a product of schooling but of the lifelong attempt to acquire it."', author: 'Albert Einstein', text: 'Every day of this 100-day challenge is a step toward wisdom. I am not just studying — I am becoming wise. 🦉' },
{ quote: '"The goal of education is not to increase the amount of knowledge but to create the possibilities for a child to invent and discover."', author: 'Jean Piaget', text: 'Piaget himself said it — learning is about discovery. I discover something new about psychology every day. 🔬' },
{ quote: '"Education breeds confidence. Confidence breeds hope. Hope breeds peace."', author: 'Confucius', text: 'My preparation breeds confidence. My confidence breeds hope. And my hope keeps me going every single day. ☮️' },
{ quote: '"The beautiful thing about learning is nobody can take it away from you."', author: 'B.B. King', text: 'Every concept I master is mine forever. I am building an unshakeable foundation for my career. 🏗️' },
{ quote: '"You are braver than you believe, stronger than you seem, and smarter than you think."', author: 'A.A. Milne', text: 'On the hard days, I remember: I am more capable than my doubts suggest. I have what it takes. 🦁' },
{ quote: '"It always seems impossible until it\'s done."', author: 'Nelson Mandela', text: 'Passing the PMLE seems impossible on hard days. But so did every other thing I have already accomplished. I will do this. ✅' },
{ quote: '"Discipline is the bridge between goals and accomplishment."', author: 'Jim Rohn', text: 'My goal is the PMLE license. My accomplishment is becoming a psychometrician. Discipline is the bridge I walk every day. 🌉' }];


interface Task {
  id: string;
  text: string;
  done: boolean;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  pinned: boolean;
}

const MOCK_ANNOUNCEMENTS: Announcement[] = [];


function getDaysUntil(dateStr: string | null): string {
  if (!dateStr) return '?';
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return '?';
  const diff = Math.ceil((target.getTime() - Date.now()) / 86400000);
  return diff > 0 ? String(diff) : '0';
}

export default function HomePage() {

  const [affirmIdx, setAffirmIdx] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [pmleDateStr, setPmleDateStr] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/pmle-date').
    then((r) => r.json()).
    then((data: {date: string | null;}) => setPmleDateStr(data.date ?? null)).
    catch(() => {/* silently keep null */});
  }, []);

  const daysUntil = getDaysUntil(pmleDateStr);
  const completedTasks = tasks.filter((t) => t.done).length;
  const taskProgress = tasks.length > 0 ? completedTasks / tasks.length * 100 : 0;

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [...prev, { id: Date.now().toString(), text: newTask.trim(), done: false }]);
    setNewTask('');
  };

  const toggleTask = (id: string) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const saveEdit = (id: string) => {setTasks((prev) => prev.map((t) => t.id === id ? { ...t, text: editText } : t));setEditingTask(null);};

  const prevAffirm = () => setAffirmIdx((i) => (i - 1 + AFFIRMATIONS.length) % AFFIRMATIONS.length);
  const nextAffirm = () => setAffirmIdx((i) => (i + 1) % AFFIRMATIONS.length);
  const shuffleAffirm = () => setAffirmIdx(Math.floor(Math.random() * AFFIRMATIONS.length));

  const affirmation = AFFIRMATIONS[affirmIdx];

  return (
    <AppShell activeSection="home">
      <Helmet>
        <title>Dashboard — ATRC Premium PMLeBoards</title>
        <meta name="description" content="Your personal PMLE study dashboard: track study hours, streaks, WeBILIB logs, and daily affirmations. Built for future Psychometricians." />
        <link rel="canonical" href="https://atrcpremium.com/" />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content="ATRC Premium PMLeBoards — Psychology Licensure Study Platform" />
        <meta property="og:description" content="100 days of disciplined study for future Psychometricians. Track your PMLE prep with WeBILIB logs, leaderboard, and learning materials." />
        <meta property="og:image" content="https://atrcpremium.com/og-image.svg" />
        <meta property="og:url" content="https://atrcpremium.com/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ATRC Premium PMLeBoards" />
        <meta name="twitter:description" content="100 days of disciplined PMLE study. Track hours, streaks, and materials." />
        <meta name="twitter:image" content="https://atrcpremium.com/og-image.svg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://atrcpremium.com/#website",
              "name": "ATRC Premium PMLeBoards",
              "url": "https://atrcpremium.com/",
              "description": "Psychology licensure study platform for future Psychometricians preparing for the PMLE."
            },
            {
              "@type": "EducationalOrganization",
              "@id": "https://atrcpremium.com/#organization",
              "name": "ATRC Premium",
              "url": "https://atrcpremium.com/",
              "logo": "https://atrcpremium.com/og-image.svg",
              "description": "ATRC Premium provides a structured 100-day study program for aspiring Psychometricians preparing for the Philippine Mental Health Law Exam (PMLE)."
            },
            {
              "@type": "WebPage",
              "@id": "https://atrcpremium.com/#webpage",
              "url": "https://atrcpremium.com/",
              "name": "ATRC Premium PMLeBoards — Psychology Licensure Study Platform",
              "isPartOf": { "@id": "https://atrcpremium.com/#website" },
              "about": { "@id": "https://atrcpremium.com/#organization" },
              "datePublished": "2026-10-10",
              "dateModified": "2026-10-24"
            }
          ]
        }).replace(/</g, '\u003c')}</script>
      </Helmet>

      {/* Sync banner removed — R2 cloud storage is configured */}

      {/* ── Hero section ──────────────────────────────────────────── */}
      <div className="storybook-home-hero relative px-4 sm:px-6 md:px-10 pt-10 pb-8">
        
        {/* Faint radial warm glow top-right */}
        <div
          className="pointer-events-none absolute top-0 right-0 w-96 h-96 opacity-40"
          style={{
            background: 'radial-gradient(ellipse at top right, hsl(var(--color-accent) / 0.18), transparent 70%)'
          }} />
        

        {/* § 01 eyebrow */}
        <div className="flex items-center gap-3 mb-5">
          <span className="editorial-eyebrow" style={{ color: 'hsl(var(--color-accent))' }}>§ 01</span>
          <div className="flex-1 h-px" style={{ background: 'hsl(222 50% 16% / 0.12)' }} />
        </div>

        {/* Headline */}
        <h1 className="editorial-h1 mb-4 max-w-2xl" style={{ color: 'hsl(var(--color-navy))' }}>10 Months of <em className="editorial-accent-word">disciplined</em> study.



        </h1>
        <p
          className="text-base mb-6 max-w-lg"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: 'hsl(var(--color-body-muted))',
            lineHeight: 1.65
          }}>Track your progress, log your sessions, and climb the leaderboard on your way to your license.


        </p>

        {/* CTA row */}
        <div className="flex items-center gap-4 flex-wrap mb-8"><a href="/logs" className="btn-ink" style={{ textDecoration: 'none' }}>Log today →</a><a href="/leaderboard" className="btn-ghost" style={{ textDecoration: 'none' }}>View leaderboard</a>














        </div>

        {/* Stats strip */}
        <div
          className="flex items-stretch divide-x rounded-xl overflow-hidden"
          style={{
            border: '1px solid hsl(222 50% 16% / 0.12)',
            background: 'hsl(var(--color-card-cream))',
            maxWidth: '520px'
          }}>
          
          {[
          { label: 'Days Until PmLE', value: daysUntil },
          { label: 'Active Today', value: '0' },
          { label: 'Subjects', value: '4' }].
          map((s, i) =>
          <div
            key={s.label}
            className="flex-1 px-4 py-3 text-center"
            style={{ borderLeft: i > 0 ? '1px solid hsl(222 50% 16% / 0.10)' : 'none' }}>
            
              <div
              className="tabular-nums"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 600,
                color: 'hsl(var(--color-navy))',
                lineHeight: 1.1
              }}>
              
                {s.value}
              </div>
              <div
              className="editorial-eyebrow mt-1"
              style={{ color: 'hsl(var(--color-body-muted))', letterSpacing: '0.10em' }}>
              
                {s.label}
              </div>
            </div>
          )}
        </div>

        {/* PmLE date pill */}
        {pmleDateStr &&
        <div
          className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'hsl(43 72% 47% / 0.12)',
            color: 'hsl(var(--color-accent))',
            border: '1px solid hsl(43 72% 47% / 0.25)'
          }}>
          
            <Calendar size={11} strokeWidth={1.5} />
            <span>Target: {pmleDateStr}</span>
          </div>
        }
      </div>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8">
        <h2 className="sr-only">Dashboard</h2>

        {/* § 02 — Announcements */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="editorial-eyebrow" style={{ color: 'hsl(var(--color-accent))' }}>§ 02</span>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.25rem',
                fontWeight: 500,
                color: 'hsl(var(--color-navy))',
                letterSpacing: '-0.01em'
              }}>
              
              Announcements
            </h2>
            <div className="flex-1 h-px" style={{ background: 'hsl(222 50% 16% / 0.10)' }} />
          </div>

          <div className="editorial-card p-0 overflow-hidden">
            {MOCK_ANNOUNCEMENTS.length === 0 ?
            <div className="p-8 text-center" style={{ color: 'hsl(var(--color-body-muted))' }}>
                <p className="text-sm font-medium">No announcements yet.</p>
                <p className="text-xs mt-1 opacity-70">Check back soon — the admin will post updates here.</p>
              </div> :
            MOCK_ANNOUNCEMENTS.map((a, i) =>
            <div
              key={a.id}
              className="px-6 py-4"
              style={{ borderTop: i > 0 ? '1px solid hsl(222 50% 16% / 0.08)' : 'none' }}>
              
                <div className="flex items-start gap-2 mb-1">
                  {a.pinned &&
                <span
                  className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                  style={{ background: 'hsl(43 72% 47% / 0.15)', color: 'hsl(var(--color-accent))' }}>
                  
                      Pinned
                    </span>
                }
                  <h3 className="text-sm font-semibold" style={{ color: 'hsl(var(--color-body-text))' }}>{a.title}</h3>
                </div>
                <p className="text-xs leading-relaxed mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>{a.body}</p>
                <span className="text-[10px]" style={{ color: 'hsl(var(--color-body-muted))' }}>{a.date}</span>
              </div>
            )}
          </div>
        </section>

        {/* § 03 — Affirmation + Daily Challenge */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="editorial-eyebrow" style={{ color: 'hsl(var(--color-accent))' }}>§ 03</span>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.25rem',
                fontWeight: 500,
                color: 'hsl(var(--color-navy))',
                letterSpacing: '-0.01em'
              }}>
              
              Daily Practice
            </h2>
            <div className="flex-1 h-px" style={{ background: 'hsl(222 50% 16% / 0.10)' }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Daily Affirmation */}
            <div className="editorial-card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="editorial-eyebrow" style={{ color: 'hsl(var(--color-body-muted))' }}>Daily Affirmation</span>
                <span className="text-[10px] font-medium tabular-nums" style={{ color: 'hsl(var(--color-body-muted))' }}>
                  {affirmIdx + 1} / {AFFIRMATIONS.length}
                </span>
              </div>
              <blockquote
                className="text-sm italic leading-relaxed"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: 'hsl(var(--color-accent))',
                  borderLeft: '2px solid hsl(43 72% 47% / 0.30)',
                  paddingLeft: '12px'
                }}>
                
                {affirmation.quote}
              </blockquote>
              <p className="text-xs font-medium" style={{ color: 'hsl(var(--color-body-muted))' }}>— {affirmation.author}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--color-body-text))' }}>{affirmation.text}</p>
              <div className="flex items-center gap-2 mt-auto pt-2" style={{ borderTop: '1px solid hsl(222 50% 16% / 0.08)' }}>
                <button
                  onClick={prevAffirm}
                  className="p-2 rounded-lg transition-colors"
                  style={{ border: '1px solid hsl(222 50% 16% / 0.15)', color: 'hsl(var(--color-body-muted))' }}
                  onMouseEnter={(e) => {(e.currentTarget as HTMLButtonElement).style.background = 'hsl(222 50% 16% / 0.05)';}}
                  onMouseLeave={(e) => {(e.currentTarget as HTMLButtonElement).style.background = 'transparent';}}>
                  
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={shuffleAffirm}
                  className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium rounded-lg flex-1 justify-center transition-colors"
                  style={{ border: '1px solid hsl(222 50% 16% / 0.15)', color: 'hsl(var(--color-body-muted))' }}
                  onMouseEnter={(e) => {(e.currentTarget as HTMLButtonElement).style.background = 'hsl(222 50% 16% / 0.05)';}}
                  onMouseLeave={(e) => {(e.currentTarget as HTMLButtonElement).style.background = 'transparent';}}>
                  
                  <Shuffle size={12} /> Shuffle
                </button>
                <button
                  onClick={nextAffirm}
                  className="p-2 rounded-lg transition-colors"
                  style={{ border: '1px solid hsl(222 50% 16% / 0.15)', color: 'hsl(var(--color-body-muted))' }}
                  onMouseEnter={(e) => {(e.currentTarget as HTMLButtonElement).style.background = 'hsl(222 50% 16% / 0.05)';}}
                  onMouseLeave={(e) => {(e.currentTarget as HTMLButtonElement).style.background = 'transparent';}}>
                  
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Daily Challenge */}
            <div className="editorial-card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="editorial-eyebrow" style={{ color: 'hsl(var(--color-body-muted))' }}>Daily Challenge</span>
                <span className="text-[10px] font-medium tabular-nums" style={{ color: 'hsl(var(--color-body-muted))' }}>
                  {completedTasks}/{tasks.length} done
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(222 50% 16% / 0.10)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${taskProgress}%`, background: 'hsl(var(--color-accent))' }} />
                
              </div>

              {/* Task list */}
              <div className="space-y-2 flex-1 max-h-48 overflow-y-auto">
                {tasks.map((task) =>
                <div key={task.id} className="flex items-center gap-2">
                    <button onClick={() => toggleTask(task.id)} className="shrink-0">
                      {task.done ?
                    <CheckCircle2 size={15} strokeWidth={1.5} style={{ color: 'hsl(var(--color-accent))' }} /> :
                    <Circle size={15} strokeWidth={1.5} style={{ color: 'hsl(var(--color-body-muted))' }} />
                    }
                    </button>
                    {editingTask === task.id ?
                  <input
                    value={editText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditText(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && saveEdit(task.id)}
                    className="flex-1 text-xs px-2 py-1 rounded-lg outline-none"
                    style={{ border: '1px solid hsl(222 50% 16% / 0.20)', color: 'hsl(var(--color-input-text))', background: 'hsl(var(--color-card-cream))' }}
                    autoFocus /> :


                  <span
                    className="flex-1 text-xs"
                    style={{ color: 'hsl(var(--color-body-text))', textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.5 : 1 }}>
                    
                        {task.text}
                      </span>
                  }
                    <div className="flex gap-1 shrink-0">
                      {editingTask === task.id ?
                    <button onClick={() => saveEdit(task.id)} className="p-1" style={{ color: 'hsl(var(--color-accent))' }}><Save size={12} /></button> :

                    <button onClick={() => {setEditingTask(task.id);setEditText(task.text);}} className="p-1 opacity-40 hover:opacity-80 transition-opacity" style={{ color: 'hsl(var(--color-body-muted))' }}><Edit2 size={12} /></button>
                    }
                      <button onClick={() => deleteTask(task.id)} className="p-1 opacity-40 hover:opacity-80 transition-opacity" style={{ color: '#e57373' }}><Trash2 size={12} /></button>
                    </div>
                  </div>
                )}
                {tasks.length === 0 &&
                <p className="text-xs text-center py-4" style={{ color: 'hsl(var(--color-body-muted))' }}>
                    No tasks yet. Add your first challenge below.
                  </p>
                }
              </div>

              {/* Add task */}
              <div className="flex gap-2 mt-auto pt-2" style={{ borderTop: '1px solid hsl(222 50% 16% / 0.08)' }}>
                <input
                  value={newTask}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addTask()}
                  placeholder="Add a task…"
                  className="flex-1 text-xs px-3 py-2 rounded-lg outline-none"
                  style={{
                    border: '1px solid hsl(222 50% 16% / 0.18)',
                    color: 'hsl(var(--color-input-text))',
                    background: 'hsl(var(--color-card-cream))'
                  }} />
                
                <button
                  onClick={addTask}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all"
                  style={{
                    background: 'hsl(var(--color-navy))',
                    color: 'hsl(var(--color-page-bg))',
                    boxShadow: '0 1px 3px hsl(222 50% 16% / 0.20)'
                  }}
                  onMouseEnter={(e) => {(e.currentTarget as HTMLButtonElement).style.background = 'hsl(222 50% 20%)';}}
                  onMouseLeave={(e) => {(e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--color-navy))';}}>
                  
                  <Plus size={12} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>);

}
