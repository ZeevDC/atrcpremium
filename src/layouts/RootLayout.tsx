import { Helmet } from '@dr.pogodin/react-helmet';
import { type ReactElement } from 'react';
import { ScrollRestoration } from 'react-router';

import HomepageSameAsJsonLd from '@/components/HomepageSameAsJsonLd';
import Website from '@/layouts/Website';

/**
 * Root layout for ATRC Premium app shell.
 * No shared header/footer — the app shell manages its own chrome.
 */
interface RootLayoutProps {
  children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <Website>
      <Helmet>
        <title>ATRC Premium — Psychology Licensure Study Platform</title>
        <meta name="description" content="ATRC Premium PMLeBoards: the all-in-one study platform for future Psychometricians preparing for the Philippine Mental Health Law Exam (PMLE)." />
      </Helmet>
      <HomepageSameAsJsonLd />
      <ScrollRestoration />
      {children}
    </Website>
  );
}
