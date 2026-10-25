import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import AppShell from '@/components/app/AppShell';
import { tos_tracker } from 'virtual:content';

interface TOSItem {
  id: string;
  code: string;
  text: string;
}

interface TOSSection {
  id: string;
  label: string;
  weight: number;
  items: number;
  subsections: { id: string; label: string; items: TOSItem[] }[];
}

interface TOSSubject {
  id: string;
  name: string;
  emoji: string;
  color: string;
  totalWeight: number;
  sections: TOSSection[];
}

const TOS_DATA: TOSSubject[] = [
  {
    id: 'abnormal', name: 'Abnormal Psychology', emoji: '🧠', color: '#a78bfa', totalWeight: 20,
    sections: [
      { id: 'A', label: 'A. Manifestations of Behavior', weight: 5, items: 5, subsections: [
        { id: 'A.1', label: 'A.1 Normalcy and Abnormalcy', items: [
          { id: 'A.1.1', code: 'A.1.1', text: 'Recognize normal and abnormal manifestations of behavior' },
          { id: 'A.1.2', code: 'A.1.2', text: 'Assess abnormal manifestations of behaviors based on social contexts' },
        ]},
      ]},
      { id: 'B', label: 'B. Psychological Disorders & Specific Symptoms (DSM-5)', weight: 50, items: 50, subsections: [
        { id: 'B.1', label: 'B.1 Psychological Disorders & Specific Symptoms', items: [
          { id: 'B.1.1', code: 'B.1.1', text: 'Anxiety Disorders' },
          { id: 'B.1.2', code: 'B.1.2', text: 'Trauma- and Stressor-Related Disorders' },
          { id: 'B.1.3', code: 'B.1.3', text: 'Obsessive-Compulsive Disorders' },
          { id: 'B.1.4', code: 'B.1.4', text: 'Somatic Symptoms' },
          { id: 'B.1.5', code: 'B.1.5', text: 'Dissociative Disorders' },
          { id: 'B.1.6', code: 'B.1.6', text: 'Depressive Disorders' },
          { id: 'B.1.7', code: 'B.1.7', text: 'Eating and Sleeping Disorders' },
          { id: 'B.1.8', code: 'B.1.8', text: 'Sexual Dysfunctions, Paraphilic Disorders and Gender Dysphoria' },
          { id: 'B.1.9', code: 'B.1.9', text: 'Substance-Related and Addictive Disorder' },
          { id: 'B.1.10', code: 'B.1.10', text: 'Impulse Control Disorders' },
          { id: 'B.1.11', code: 'B.1.11', text: 'Personality Disorders' },
          { id: 'B.1.12', code: 'B.1.12', text: 'Schizophrenia' },
          { id: 'B.1.13', code: 'B.1.13', text: 'Neurodevelopmental Disorders' },
          { id: 'B.1.14', code: 'B.1.14', text: 'Neurocognitive Disorders' },
        ]},
      ]},
      { id: 'C', label: 'C. Theoretical Approaches in Explaining Etiology', weight: 20, items: 20, subsections: [
        { id: 'C.1', label: 'C.1 Theoretical Models', items: [
          { id: 'C.1.1', code: 'C.1.1', text: 'Genetic Contributions' },
          { id: 'C.1.2', code: 'C.1.2', text: 'Biological and Neurological Bases' },
          { id: 'C.1.3', code: 'C.1.3', text: 'Role of Learning' },
          { id: 'C.1.4', code: 'C.1.4', text: 'Cognitive Theories' },
          { id: 'C.1.5', code: 'C.1.5', text: 'Diathesis Stress Model' },
          { id: 'C.1.6', code: 'C.1.6', text: 'Gene-Environment Interaction' },
          { id: 'C.1.7', code: 'C.1.7', text: 'Culture, Social Interactions, and Interpersonal Factors' },
        ]},
      ]},
      { id: 'D', label: 'D. Therapeutic Interventions', weight: 10, items: 10, subsections: [
        { id: 'D.1', label: 'D.1 Psychological Interventions', items: [
          { id: 'D.1.1', code: 'D.1.1', text: 'Explain, illustrate the application, and evaluate psychological interventions for treatment of psychological disorders' },
        ]},
      ]},
      { id: 'E', label: 'E. Socio-Cultural Factors & Ethical Principles', weight: 5, items: 5, subsections: [
        { id: 'E.1', label: 'E.1 Socio-Cultural Factors', items: [
          { id: 'E.1.1', code: 'E.1.1', text: 'Identify socio-cultural factors that may impact diagnosing' },
        ]},
        { id: 'E.2', label: 'E.2 Ethics in Diagnosing Mental Disorders', items: [
          { id: 'E.2.1', code: 'E.2.1', text: 'Ethical principles and standards' },
        ]},
      ]},
      { id: 'F', label: 'F. Global Health Crisis & Mental Health Law', weight: 10, items: 10, subsections: [
        { id: 'F.1', label: 'F.1 RA11036 & COVID-19 Impact', items: [
          { id: 'F.1.1', code: 'F.1.1', text: 'Issues and concerns in various settings (educational, occupational, community) on the impact of COVID-19 on mental health and challenges of RA11036' },
          { id: 'F.1.2', code: 'F.1.2', text: 'Evaluate the impact of global health crisis and other mental health conditions on the implementation of RA11036' },
        ]},
      ]},
    ],
  },
  {
    id: 'io', name: 'I/O Psychology', emoji: '🏢', color: '#34d399', totalWeight: 20,
    sections: [
      { id: 'A', label: 'A. Organizational Theory', weight: 20, items: 20, subsections: [
        { id: 'A.1', label: 'A.1 Org Theories, Models, Concepts', items: [
          { id: 'io-A.1.1', code: '1', text: 'Identify the different org theories, models, and concepts' },
          { id: 'io-A.1.2', code: '2', text: 'Apply org theories to human behavior: Classical, Neo-Classical, Modern, Contingency, Motivation, Open Systems' },
          { id: 'io-A.1.3', code: '3', text: 'Examine the importance of org theory to improve: structure, leadership, managerial style, group behavior, motivation, communication, operational efficiency, org culture' },
        ]},
      ]},
      { id: 'B', label: 'B. Organizational Structures & Systems', weight: 20, items: 20, subsections: [
        { id: 'B.1', label: 'B.1 Org Models & Systems', items: [
          { id: 'io-B.1.1', code: '1', text: 'Evaluate the value and importance of knowing various org models & systems' },
          { id: 'io-B.1.2', code: '2', text: 'Pros and cons of org structures: Functional, Multi-Divisional, Flat, Matrix, Team, Network, Hierarchical' },
          { id: 'io-B.1.3', code: '3', text: 'Define elements of org structure: Job Design, Departmentation, Delegation, Span of Control, Chain of Command' },
          { id: 'io-B.1.4', code: '4', text: 'Apply understanding of org design to appreciate org roles and performance accountability' },
          { id: 'io-B.1.5', code: '5', text: 'Explain the importance of aligning org structure with business strategy' },
          { id: 'io-B.1.6', code: '6', text: 'Apply understanding of the 4 business elements for profitable performance and business success' },
        ]},
      ]},
      { id: 'C', label: 'C. Human Resource Devt & HRM', weight: 25, items: 25, subsections: [
        { id: 'C.1', label: 'C.1 HRD & HRM', items: [
          { id: 'io-C.1.1', code: '1', text: 'Differentiate HRD & HRM, HRD & OD, HRD & Employee Training' },
          { id: 'io-C.1.2', code: '2', text: 'Identify the activities involved in HRD' },
          { id: 'io-C.1.3', code: '3', text: 'Examine the scope of HRD: Training, Learning, Career Development, Talent Management, Performance Appraisal, Employee Engagement & Empowerment' },
          { id: 'io-C.1.4', code: '4', text: 'Analyze HRM activities: Manpower Planning, Staffing, Developing, Monitoring, Maintaining, Managing Relationship & Evaluating' },
          { id: 'io-C.1.5', code: '5', text: 'Compare the role of HR Manager & HRD Manager' },
        ]},
      ]},
      { id: 'D', label: 'D. Team Dynamics', weight: 15, items: 15, subsections: [
        { id: 'D.1', label: 'D.1 Team Dynamics', items: [
          { id: 'io-D.1.1', code: '1', text: 'Importance & impact of team dynamics' },
          { id: 'io-D.1.2', code: '2', text: 'Stages of team development' },
          { id: 'io-D.1.3', code: '3', text: 'Group processes that affect team effectiveness' },
          { id: 'io-D.1.4', code: '4', text: 'Common problems that occur in teams' },
          { id: 'io-D.1.5', code: '5', text: 'Address team problems and improve team performance' },
        ]},
      ]},
      { id: 'E', label: 'E. Organizational Change & Development', weight: 20, items: 20, subsections: [
        { id: 'E.1', label: 'E.1 Org Change & Development', items: [
          { id: 'io-E.1.1', code: '1', text: 'Difference between Org Change & Org Development, and Org Development & Org Transformation' },
          { id: 'io-E.1.2', code: '2', text: 'Different factors driving organizational change' },
          { id: 'io-E.1.3', code: '3', text: 'Different types of large scale organizational change' },
          { id: 'io-E.1.4', code: '4', text: 'Evaluate the different types of org interventions' },
          { id: 'io-E.1.5', code: '5', text: 'Different strategies & techniques orgs use to manage change and achieve org efficiency' },
        ]},
      ]},
    ],
  },
  {
    id: 'dev', name: 'Developmental Psychology', emoji: '🌱', color: 'hsl(var(--color-gold))', totalWeight: 20,
    sections: [
      { id: 'A', label: 'A. Perspectives on Nature and Nurture', weight: 5, items: 5, subsections: [
        { id: 'A.1', label: 'A.1 Heredity & Environment', items: [
          { id: 'dev-A.1.1', code: '1', text: 'Explain the role of heredity & environment in human growth & development' },
          { id: 'dev-A.1.2', code: '2', text: 'Illustrate the influence of heredity and environment on the development of persons' },
          { id: 'dev-A.1.3', code: '3', text: 'Identify the characteristics that pertain to heredity and environment' },
        ]},
      ]},
      { id: 'B', label: 'B. Research Methods & Ethical Considerations', weight: 5, items: 5, subsections: [
        { id: 'B.1', label: 'B.1 Ethics in Research', items: [
          { id: 'dev-B.1.1', code: '1', text: 'Identify the ethical consideration of various research methods in developmental psychology' },
          { id: 'dev-B.1.2', code: '2', text: 'Research methods in developmental psychology' },
          { id: 'dev-B.1.3', code: '3', text: 'Recognize the different basic research designs in studying human development' },
          { id: 'dev-B.1.4', code: '4', text: 'Differentiate cross-sectional and longitudinal studies in conducting research investigation in human development' },
        ]},
      ]},
      { id: 'C', label: 'C. Developmental Theories', weight: 25, items: 25, subsections: [
        { id: 'C.1', label: 'C.1 Theories', items: [
          { id: 'dev-C.1.1', code: '1', text: 'Psychosexual Theory of Freud' },
          { id: 'dev-C.1.2', code: '2', text: 'Psychosocial Theory of Erikson' },
          { id: 'dev-C.1.3', code: '3', text: 'Cognitive Development of Piaget' },
          { id: 'dev-C.1.4', code: '4', text: "Kohlberg's Moral Development" },
          { id: 'dev-C.1.5', code: '5', text: "Bronfenbrenner's Ecological Model of Development" },
          { id: 'dev-C.1.6', code: '6', text: "Vygotsky's Sociocultural Theory" },
          { id: 'dev-C.1.7', code: '7', text: "Ainsworth's Strange Situation & Mahler's Attachment Theory" },
          { id: 'dev-C.1.8', code: '8', text: "Marcia's Identity Formation" },
          { id: 'dev-C.1.9', code: '9', text: 'Different Learning Theories based on Behaviorism and Social Learning' },
          { id: 'dev-C.1.10', code: '10', text: "Wilson's Evolutionary Theory of Development" },
        ]},
      ]},
    ],
  },
  {
    id: 'pa', name: 'Psychological Assessment', emoji: '📊', color: '#60a5fa', totalWeight: 40,
    sections: [
      { id: 'A', label: 'A. Psychometric Principles', weight: 45, items: 59, subsections: [
        { id: 'A.1', label: 'A.1 Psychometric Principles', items: [
          { id: 'pa-A.1.1', code: '1', text: 'Identify the different psychometric principles' },
          { id: 'pa-A.1.2', code: '2', text: 'Explain the different psychometric principles' },
          { id: 'pa-A.1.3', code: '3', text: 'Apply psychometric principles in test construction' },
          { id: 'pa-A.1.4', code: '4', text: 'Evaluate the psychometric properties of assessment instruments' },
          { id: 'pa-A.1.5', code: '5', text: 'Examine the ways psychometric principles are applied in interpretation of results and usage of assessment outcomes' },
          { id: 'pa-A.1.6', code: '6', text: 'Evaluate the application of psychometric properties in development of assessment instruments' },
        ]},
      ]},
      { id: 'B', label: 'B. Research Methods and Statistics', weight: 15, items: 20, subsections: [
        { id: 'B.1', label: 'B.1 Research Methods', items: [
          { id: 'pa-B.1.1', code: '1', text: 'Ascertain psychometric properties essential in assessment' },
          { id: 'pa-B.1.2', code: '2', text: 'Explain methods and statistics used' },
          { id: 'pa-B.1.3', code: '3', text: 'Apply, appraise, & analyze the appropriate research methods and statistics for test development, standardization, and studies on tests' },
        ]},
      ]},
      { id: 'C', label: 'C. Uses, Benefits, Limitations of Assessment Tools', weight: 10, items: 13, subsections: [
        { id: 'C.1', label: 'C.1 Assessment Methods and Tools', items: [
          { id: 'pa-C.1.1', code: '1', text: 'Purpose and benefits of different assessment methods and tools' },
          { id: 'pa-C.1.2', code: '2', text: 'Appropriateness, strengths and limitations of assessment tools' },
        ]},
      ]},
      { id: 'D', label: 'D. Selection of Assessment Methods and Tools', weight: 15, items: 19, subsections: [
        { id: 'D.1', label: 'D.1 Selection Criteria', items: [
          { id: 'pa-D.1.1', code: '1', text: 'Identify appropriate & clarify rationale of assessment methods, tools, for specific purposes' },
          { id: 'pa-D.1.2', code: '2', text: 'Specific tools needed for specific populations, settings, circumstances' },
          { id: 'pa-D.1.3', code: '3', text: 'Specific tools needed for individual or group test' },
          { id: 'pa-D.1.4', code: '4', text: 'Selected methods and instruments for specific information needed' },
          { id: 'pa-D.1.5', code: '5', text: 'Recommended tools for specific needs and goals' },
        ]},
      ]},
      { id: 'E', label: 'E. Test Administration, Scoring, Interpretation', weight: 15, items: 20, subsections: [
        { id: 'E.1', label: 'E.1 Test Administration', items: [
          { id: 'pa-E.1.1', code: '1', text: 'Detect errors and impact of errors in test selection, administration, and scoring' },
          { id: 'pa-E.1.2', code: '2', text: 'Challenges and anomalies in test selection, administration, and scoring' },
          { id: 'pa-E.1.3', code: '3', text: 'Usefulness of tests under varying conditions of test administration, scoring, and interpretation' },
        ]},
      ]},
      { id: 'F', label: 'F. Ethical Principles and Standards of Practice', weight: 15, items: 19, subsections: [
        { id: 'F.1', label: 'F.1 Ethics', items: [
          { id: 'pa-F.1.1', code: '1', text: 'Test interpretation and usage' },
          { id: 'pa-F.1.2', code: '2', text: 'Violation of ethics and standards of good practice' },
          { id: 'pa-F.1.3', code: '3', text: 'Situations that may challenge the application of ethics' },
          { id: 'pa-F.1.4', code: '4', text: 'Different possibilities for avoiding ethical violations' },
          { id: 'pa-F.1.5', code: '5', text: 'Ethical appropriateness of psychometric matters' },
        ]},
      ]},
    ],
  },
];

export default function TOSTrackerPage() {
  const allItemIds = TOS_DATA.flatMap(sub => sub.sections.flatMap(sec => sec.subsections.flatMap(ss => ss.items.map(i => i.id))));
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [activeSubject, setActiveSubject] = useState(TOS_DATA[0].id);

  const toggle = (id: string) => setChecked(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const subjectProgress = (sub: TOSSubject) => {
    const ids = sub.sections.flatMap(sec => sec.subsections.flatMap(ss => ss.items.map(i => i.id)));
    return ids.length > 0 ? Math.round((ids.filter(id => checked.has(id)).length / ids.length) * 100) : 0;
  };

  const overallProgress = allItemIds.length > 0 ? Math.round((allItemIds.filter(id => checked.has(id)).length / allItemIds.length) * 100) : 0;
  const activeSubjectData = TOS_DATA.find(s => s.id === activeSubject)!;

  return (
    <AppShell activeSection="tos-tracker">
      <Helmet>
        <title>TOS Tracker — ATRC Premium PMLeBoards</title>
        <meta name="description" content="Track your Table of Specifications (TOS) coverage for the PMLE. Monitor progress across all psychology subjects and ensure complete board exam preparation." />
        <link rel="canonical" href="https://atrcpremium.com/tos-tracker" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto space-y-5">
        <h1 className="text-2xl sm:text-3xl font-black uppercase" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))' }}>{tos_tracker.heading}</h1>

        {/* Overall progress */}
        <div className="p-4 rounded" style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', boxShadow: '5px 5px 0 hsl(var(--color-black-border))' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-black uppercase" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-body-text))' }}>{tos_tracker.overallCoverageLabel}</span>
            <span className="text-lg font-black" style={{ color: 'hsl(var(--color-gold))' }}>{overallProgress}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'hsl(var(--color-navy-mid))' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${overallProgress}%`, background: 'hsl(var(--color-gold))' }} />
          </div>
          <p className="text-xs mt-1" style={{ color: 'hsl(var(--color-body-muted))' }}>{allItemIds.filter(id => checked.has(id)).length} of {allItemIds.length} <span>{tos_tracker.itemsCoveredSuffix}</span></p>
        </div>

        {/* Subject tabs */}
        <div className="flex flex-wrap gap-2">
          {TOS_DATA.map(sub => {
            const pct = subjectProgress(sub);
            return (
              <button key={sub.id} onClick={() => setActiveSubject(sub.id)} className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all" style={{ background: activeSubject === sub.id ? 'hsl(var(--color-navy))' : 'transparent', color: activeSubject === sub.id ? 'hsl(var(--color-page-bg))' : 'hsl(var(--color-body-muted))', border: activeSubject === sub.id ? '1.5px solid hsl(var(--color-navy))' : '1.5px solid hsl(var(--color-hairline-strong))', boxShadow: activeSubject === sub.id ? '0 1px 4px hsl(var(--color-navy) / 0.18)' : 'none' }}>
                <span>{sub.emoji}</span>
                <span className="hidden sm:inline">{sub.name}</span>
                <span className="inline sm:hidden">{sub.name.split(' ')[0]}</span>
                <span className="font-black">{pct}%</span>
              </button>
            );
          })}
        </div>

        {/* Active subject checklist */}
        <div style={{ background: 'hsl(var(--color-card-cream))', border: '1px solid hsl(222 50% 16% / 0.12)', borderRadius: '14px', boxShadow: '0 1px 2px hsl(222 50% 16% / 0.06), 0 8px 24px -12px hsl(222 50% 16% / 0.15)', overflow: 'hidden' }}>
          <div className="px-4 py-3 flex items-start justify-between gap-2" style={{ background: activeSubjectData.color, borderBottom: '2px solid hsl(var(--color-black-border))' }}>
            <h2 className="text-base font-semibold leading-snug" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 600 }}>{activeSubjectData.emoji} {activeSubjectData.name} ({activeSubjectData.totalWeight}% of board exam)</h2>
            <span className="text-base font-black shrink-0" style={{ color: 'hsl(var(--color-black-border))' }}>{subjectProgress(activeSubjectData)}%</span>
          </div>
          <div className="p-4 space-y-5">
            {activeSubjectData.sections.map(sec => {
              const secIds = sec.subsections.flatMap(ss => ss.items.map(i => i.id));
              const secChecked = secIds.filter(id => checked.has(id)).length;
              return (
                <div key={sec.id}>
                  <div className="mb-2 pb-1.5" style={{ borderBottom: '2px solid hsl(var(--color-divider-cream))' }}>
                    <h3 className="text-sm font-black uppercase leading-snug" style={{ color: 'hsl(var(--color-body-text))' }}>{sec.label}</h3>
                    <span className="text-xs font-semibold mt-0.5 block" style={{ color: 'hsl(var(--color-body-muted))' }}>{sec.weight}% · {sec.items} items · {secChecked}/{secIds.length} done</span>
                  </div>
                  {sec.subsections.map(ss => (
                    <div key={ss.id} className="mb-3">
                      <p className="text-xs font-bold uppercase mb-2 leading-snug" style={{ color: 'hsl(var(--color-body-muted))' }}>{ss.label}</p>
                      <div className="space-y-2 pl-2">
                        {ss.items.map(item => (
                          <label key={item.id} className="flex items-start gap-2.5 cursor-pointer group">
                            <div
                              onClick={() => toggle(item.id)}
                              className="mt-0.5 w-4 h-4 rounded shrink-0 flex items-center justify-center transition-all"
                              style={{ background: checked.has(item.id) ? activeSubjectData.color : 'transparent', border: `2px solid ${checked.has(item.id) ? 'hsl(var(--color-black-border))' : 'hsl(var(--color-input-border))'}` }}
                            >
                              {checked.has(item.id) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="hsl(var(--color-black-border))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <span className="text-sm leading-relaxed" style={{ color: checked.has(item.id) ? 'hsl(var(--color-body-muted))' : 'hsl(var(--color-body-text))', textDecoration: checked.has(item.id) ? 'line-through' : 'none' }}>{item.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
