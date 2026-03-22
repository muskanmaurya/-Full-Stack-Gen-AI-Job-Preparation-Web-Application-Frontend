import React, { useMemo, useState } from 'react'
import "../styles/home.scss"
import {useInterview} from "../../auth/hooks/useInterview.js"

const Home = () => {
  const [jobDescription, setJobDescription] = useState("")
  const [selfDescription, setSelfDescription] = useState("")
  const [resumeName, setResumeName] = useState("No file selected")

  const jobCharacterCount = useMemo(() => jobDescription.length, [jobDescription])

  const handleResumeChange = (event) => {
    const selectedFile = event.target.files?.[0]
    setResumeName(selectedFile ? selectedFile.name : "No file selected")
  }

  return (
    <main className='home'>
      <section className='home-shell'>
        <header className='home-header'>
          <h1>
            Create Your Custom <span>Interview Plan</span>
          </h1>
          <p>
            Let our AI analyze the job requirements and your unique profile to
            build a winning strategy.
          </p>
        </header>

        <div className='interview-input-group'>
          <div className='left'>
            <div className='section-title-row'>
              <h2>Target Job Description</h2>
              <span className='tag required'>Required</span>
            </div>

            <textarea
              name='jobDescription'
              id='jobDescription'
              placeholder='Paste the full job description here...'
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
            ></textarea>

            <p className='character-count'>{jobCharacterCount} / 5000 chars</p>
          </div>

          <div className='right'>
            <div className='section-title-row'>
              <h2>Your Profile</h2>
            </div>

            <div className='input-group'>
              <div className='label-row'>
                <label htmlFor='resume'>Upload Resume</label>
                <span className='tag'>Best Results</span>
              </div>

              <label htmlFor='resume' className='upload-box'>
                <span className='upload-icon'>⇪</span>
                <span className='upload-title'>Click to upload or drag and drop</span>
                <span className='upload-meta'>PDF or DOCX (Max 5MB)</span>
              </label>

              <input
                type='file'
                name='resume'
                id='resume'
                accept='.pdf,.doc,.docx'
                onChange={handleResumeChange}
              />
              <p className='file-name'>{resumeName}</p>
            </div>

            <div className='or-divider'>OR</div>

            <div className='input-group'>
              <label htmlFor='selfDescription'>Quick Self-Description</label>
              <textarea
                name='selfDescription'
                id='selfDescription'
                placeholder='Briefly describe your experience, key skills, and goals.'
                value={selfDescription}
                onChange={(event) => setSelfDescription(event.target.value)}
              ></textarea>
            </div>

            <p className='helper-note'>
              Either a resume or a self-description is required to generate a personalized plan.
            </p>
          </div>
        </div>

        <footer className='home-card-footer'>
          <p>AI-Powered Strategy Generation • Approx 30s</p>
          <button className='generate-btn'>Generate My Interview Strategy</button>
        </footer>

        <nav className='home-links' aria-label='Footer links'>
          <a href='#'>Privacy Policy</a>
          <a href='#'>Terms of Service</a>
          <a href='#'>Help Center</a>
        </nav>
      </section>
    </main>
  )
}

export default Home