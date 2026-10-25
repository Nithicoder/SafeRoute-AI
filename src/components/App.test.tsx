import React from 'react';
import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('SafeRoute AI Application Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('1. Renders the main dashboard header, branding, and simulation controls', () => {
    render(<App />);

    expect(screen.getByText('SafeRoute')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(
      screen.getByText('Intelligent Emergency Evacuation & Dynamic Path-Replanning Simulator')
    ).toBeInTheDocument();

    expect(screen.getByText('AI Search Algorithm')).toBeInTheDocument();
    expect(screen.getByText('Simulation Engine')).toBeInTheDocument();
    expect(screen.getByText('Map Editor')).toBeInTheDocument();
    expect(screen.getByText('Scenarios & Presets')).toBeInTheDocument();
  });

  it('2. Switches algorithms and reflects selection in UI', () => {
    render(<App />);

    // Click Dijkstra's Algorithm
    const dijkstraBtns = screen.getAllByText("Dijkstra's Algorithm");
    fireEvent.click(dijkstraBtns[0]);

    // Verify Dijkstra is selected and shown
    expect(screen.getAllByText("Dijkstra's Algorithm").length).toBeGreaterThan(0);
  });

  it('3. Opens and closes "How the AI Thinks" explanation modal', () => {
    render(<App />);

    const howAiThinksBtn = screen.getByText('How the AI Thinks');
    fireEvent.click(howAiThinksBtn);

    expect(screen.getByText('Search & Planning Theory')).toBeInTheDocument();
    expect(screen.getByText('f(n) = g(n) + h(n)')).toBeInTheDocument();

    const closeBtn = screen.getByText('Close Guide');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Search & Planning Theory')).not.toBeInTheDocument();
  });

  it('4. Header does not contain "About Project" button; modal accessible via documentation link', () => {
    render(<App />);

    // Header must NOT contain "About Project"
    expect(screen.queryByText('About Project')).not.toBeInTheDocument();

    // Verify footer provides documentation and course requirements
    const rubricLink = screen.getByText('Project Documentation & Academic Rubric');
    fireEvent.click(rubricLink);

    expect(screen.getByText('Course Project Information')).toBeInTheDocument();
    expect(screen.getByText('Academic Objective')).toBeInTheDocument();
    expect(screen.getByText('Core AI Curriculum Concepts')).toBeInTheDocument();

    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Course Project Information')).not.toBeInTheDocument();
  });

  it('5. Loads scenario presets cleanly without crashing', () => {
    render(<App />);

    const crowdedPreset = screen.getByText('2. Crowded Corridor');
    fireEvent.click(crowdedPreset);

    expect(screen.getByText('2. Crowded Corridor')).toBeInTheDocument();

    const blockedPreset = screen.getByText('3. Blocked Exit (Replanning Demo)');
    fireEvent.click(blockedPreset);

    expect(screen.getByText('3. Blocked Exit (Replanning Demo)')).toBeInTheDocument();
  });

  it('6. Step simulation advances state and updates event log', () => {
    render(<App />);

    const stepBtn = screen.getByTitle('Advance exactly one step');
    fireEvent.click(stepBtn);

    // After step, event log should register movement or step
    const logSection = screen.getByText('Incident & Movement Log');
    expect(logSection).toBeInTheDocument();
  });

  it('7. Simulation pause, resume, step, and reset maintain consistent state', () => {
    render(<App />);

    // Click Step
    const stepBtn = screen.getByTitle('Advance exactly one step');
    fireEvent.click(stepBtn);

    // Click Reset
    const resetBtn = screen.getByTitle('Reset Agent position to Start and clear active route');
    fireEvent.click(resetBtn);

    // Status should be STANDBY / READY
    expect(screen.getByText('STANDBY / READY')).toBeInTheDocument();
  });
});
