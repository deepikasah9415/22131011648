import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Paper, IconButton, Card, CardContent, Divider, Alert, Stack } from '@mui/material';
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 6 }}>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>URL Shortener</Typography>
          <Button component={Link} to="/stats" variant="outlined">View Stats</Button>
        </Box>
        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {entries.map((entry, idx) => (
                  <Paper key={idx} sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, boxShadow: 0 }}>
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
                          size="small"
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
                          size="small"
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
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton onClick={() => handleRemove(idx)} disabled={entries.length === 1} color="error">
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAdd}
                    disabled={entries.length >= 5}
                  >
                    Add URL
                  </Button>
                  <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 140 }}>
                    Shorten URLs
                  </Button>
                </Box>
                {formError && <Alert severity="error">{formError}</Alert>}
              </Stack>
            </form>
          </CardContent>
        </Card>
        {results.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>Shortened URLs</Typography>
            <Grid container spacing={2}>
              {results.map((r, i) => (
                <Grid item xs={12} key={i}>
                  <Card elevation={2} sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Original:</Typography>
                      <Typography sx={{ mb: 1 }}>{r.original}</Typography>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Short:</Typography>
                      <Typography sx={{ mb: 1 }}>
                        <a href={r.short} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>{r.short}</a>
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2"><b>Created:</b> {r.created}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2"><b>Expires:</b> {r.expires}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ShortenerPage; 