import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { log } from '../logging/logger';

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJkZWVwaWthLjIyc2NzZTEwMTE2ODVAZ2FsZ29hdGlhcy51bml2ZXJzaXR5LmVkdS5pbiIsImV4cCI6MTc1MTAxODg5NiwiaWF0IjoxNzUxMDE3OTk2LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiYTgxZGMyZjUtMjA1Zi00Y2JkLWIzZTktZjUyYWJhNjFjZjE1IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiZGVlcGlrYSIsInN1YiI6IjM5YTNjNDRmLTNjMWMtNDFmOC04OTEwLTdlMjQwZmEyY2ExNSJ9LCJlbWFpbCI6ImRlZXBpa2EuMjJzY3NlMTAxMTY4NUBnYWxnb2F0aWFzLnVuaXZlcnNpdHkuZWR1LmluIiwibmFtZSI6ImRlZXBpa2EiLCJyb2xsTm8iOiIyMjEzMTAxMTY0OCIsImFjY2Vzc0NvZGUiOiJNdWFndnEiLCJjbGllbnRJRCI6IjM5YTNjNDRmLTNjMWMtNDFmOC04OTEwLTdlMjQwZmEyY2ExNSIsImNsaWVudFNlY3JldCI6InpqZWtiUHdxeUJKYlBNeFoifQ.tDv-8PqU_d3r9pxDV4oPfmPXiWlOWGs3Mjct6o0Q79Q";

const LOCAL_STORAGE_KEY = 'shortenedUrls';

const getStoredUrls = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const setStoredUrls = (urls) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(urls));
};

const RedirectHandler = () => {
  const { shortcode } = useParams();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shortcode) return;
    const urls = getStoredUrls();
    const entry = urls.find(u => u.shortcode === shortcode);
    if (!entry) {
      setError('Short URL not found.');
      log('frontend', 'error', 'component', `Shortcode not found: ${shortcode}`, TOKEN);
      return;
    }
    // Check expiry
    const now = new Date();
    const expiry = new Date(entry.expires);
    if (now > expiry) {
      setError('This short URL has expired.');
      log('frontend', 'warn', 'component', `Shortcode expired: ${shortcode}`, TOKEN);
      return;
    }
    // Log click
    const click = {
      timestamp: now.toLocaleString(),
      source: document.referrer ? document.referrer : 'Direct',
      location: 'India', // For demo, hardcoded. In real app, use geolocation API or service.
    };
    entry.clicks = entry.clicks || [];
    entry.clicks.push(click);
    setStoredUrls(urls);
    log('frontend', 'info', 'component', `Redirected: ${shortcode}`, TOKEN);
    // Redirect
    setTimeout(() => {
      window.location.href = entry.original;
    }, 1200);
  }, [shortcode]);

  return (
    <div>
      {error ? <div style={{ color: 'red', margin: 20 }}>{error}</div> : <div>Redirecting...</div>}
    </div>
  );
};

export default RedirectHandler; 