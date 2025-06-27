import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Paper, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Link } from 'react-router-dom';
import { log } from '../logging/logger';

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJkZWVwaWthLjIyc2NzZTEwMTE2ODVAZ2FsZ29hdGlhcy51bml2ZXJzaXR5LmVkdS5pbiIsImV4cCI6MTc1MTAxODg5NiwiaWF0IjoxNzUxMDE3OTk2LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiYTgxZGMyZjUtMjA1Zi00Y2JkLWIzZTktZjUyYWJhNjFjZjE1IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiZGVlcGlrYSIsInN1YiI6IjM5YTNjNDRmLTNjMWMtNDFmOC04OTEwLTdlMjQwZmEyY2ExNSJ9LCJlbWFpbCI6ImRlZXBpa2EuMjJzY3NlMTAxMTY4NUBnYWxnb2F0aWFzLnVuaXZlcnNpdHkuZWR1LmluIiwibmFtZSI6ImRlZXBpa2EiLCJyb2xsTm8iOiIyMjEzMTAxMTY0OCIsImFjY2Vzc0NvZGUiOiJNdWFndnEiLCJjbGllbnRJRCI6IjM5YTNjNDRmLTNjMWMtNDFmOC04OTEwLTdlMjQwZmEyY2ExNSIsImNsaWVudFNlY3JldCI6InpqZWtiUHdxeUJKYlBNeFoifQ.tDv-8PqU_d3r9pxDV4oPfmPXiWlOWGs3Mjct6o0Q79Q";

const LOCAL_STORAGE_KEY = 'shortenedUrls';

const defaultEntry = () => ({ url: '', validity: '', shortcode: '', error: {} });

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

const ShortenerPage = () => {
  const [entries, setEntries] = useState([defaultEntry()]);
  const [results, setResults] = useState([]);
  const [formError, setFormError] = useState('');

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateShortcode = (code) => /^[a-zA-Z0-9]{1,20}$/.test(code);

  const handleChange = (idx, field, value) => {
    const newEntries = [...entries];
    newEntries[idx][field] = value;
    newEntries[idx].error = { ...newEntries[idx].error, [field]: undefined };
    setEntries(newEntries);
  };

  const handleAdd = () => {
    if (entries.length < 5) setEntries([...entries, defaultEntry()]);
  };

  const handleRemove = (idx) => {
    if (entries.length > 1) setEntries(entries.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    let valid = true;
    const storedUrls = getStoredUrls();
    const allShortcodes = new Set(storedUrls.map(u => u.shortcode));
    const newEntries = entries.map((entry, idx) => {
      const error = {};
      if (!entry.url || !validateUrl(entry.url)) {
        error.url = 'Invalid URL';
        valid = false;
      }
      if (entry.validity && (!/^[0-9]+$/.test(entry.validity) || parseInt(entry.validity) <= 0)) {
        error.validity = 'Validity must be a positive integer';
        valid = false;
      }
      if (entry.shortcode && !validateShortcode(entry.shortcode)) {
        error.shortcode = 'Shortcode must be alphanumeric (max 20 chars)';
        valid = false;
      }
      // Check uniqueness
      const code = entry.shortcode || '';
      if (code && allShortcodes.has(code)) {
        error.shortcode = 'Shortcode already exists';
        valid = false;
      }
      if (code) allShortcodes.add(code);
      return { ...entry, error };
    });
    // Check for duplicate shortcodes in this batch
    const codes = newEntries.map(e => e.shortcode).filter(Boolean);
    if (new Set(codes).size !== codes.length) {
      setFormError('Shortcodes must be unique');
      valid = false;
    }
    setEntries(newEntries);
    if (!valid) {
      log('frontend', 'error', 'component', 'Validation failed on ShortenerPage', TOKEN);
      return;
    }
    // Save to localStorage
    const now = new Date();
    const newUrls = newEntries.map((entry, idx) => {
      const shortcode = entry.shortcode || Math.random().toString(36).substring(2, 8);
      return {
        original: entry.url,
        shortcode,
        short: `http://localhost:3000/${shortcode}`,
        created: now.toLocaleString(),
        expires: new Date(now.getTime() + 60000 * (entry.validity ? parseInt(entry.validity) : 30)).toLocaleString(),
        clicks: [],
      };
    });
    const updatedUrls = [...storedUrls, ...newUrls];
    setStoredUrls(updatedUrls);
    setResults(newUrls);
    log('frontend', 'info', 'component', 'Shortener form submitted', TOKEN);
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>URL Shortener</Typography>
        <Button component={Link} to="/stats" variant="outlined">View Stats</Button>
      </Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {entries.map((entry, idx) => (
            <Grid item xs={12} key={idx}>
              <Paper sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      label="Long URL"
                      value={entry.url}
                      onChange={e => handleChange(idx, 'url', e.target.value)}
                      error={!!entry.error.url}
                      helperText={entry.error.url}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Validity (min)"
                      value={entry.validity}
                      onChange={e => handleChange(idx, 'validity', e.target.value)}
                      error={!!entry.error.validity}
                      helperText={entry.error.validity || 'Default: 30'}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Custom Shortcode"
                      value={entry.shortcode}
                      onChange={e => handleChange(idx, 'shortcode', e.target.value)}
                      error={!!entry.error.shortcode}
                      helperText={entry.error.shortcode}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton onClick={() => handleRemove(idx)} disabled={entries.length === 1}>
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAdd}
              disabled={entries.length >= 5}
            >
              Add URL
            </Button>
          </Grid>
          {formError && (
            <Grid item xs={12}>
              <Typography color="error">{formError}</Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">Shorten URLs</Button>
          </Grid>
        </Grid>
      </form>
      {results.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Shortened URLs</Typography>
          {results.map((r, i) => (
            <Paper key={i} sx={{ p: 2, mb: 1 }}>
              <Typography><b>Original:</b> {r.original}</Typography>
              <Typography><b>Short:</b> <a href={r.short} target="_blank" rel="noopener noreferrer">{r.short}</a></Typography>
              <Typography><b>Created:</b> {r.created}</Typography>
              <Typography><b>Expires:</b> {r.expires}</Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ShortenerPage; 