'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="shell section"><h1>A moment of pause.</h1><p>Something went wrong while opening this page. Please try again.</p><button className="button" onClick={reset}>Try again</button></main>;}
