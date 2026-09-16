import React from 'react';
import { ContinuousDocumentExperience } from './ContinuousDocumentExperience';

/**
 * VerifyPage hosts the primary Continuous Document Verification experience.
 * Atmospheric backdrop is handled globally by CinematicBackground in App.tsx.
 */
export const VerifyPage: React.FC = () => {
  return (
    <div className="verify-page relative min-h-screen">
      <div className="relative z-10 w-full">
        <ContinuousDocumentExperience />
      </div>
    </div>
  );
};

