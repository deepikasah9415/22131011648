import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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

const StatsPage = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    log('frontend', 'info', 'component', 'StatsPage mounted', TOKEN);
    setStats(getStoredUrls());
  }, []);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Shortened URL Statistics</Typography>
      {stats.length === 0 ? (
        <Typography>No URLs shortened yet.</Typography>
      ) : (
        stats.map((stat, idx) => (
          <Paper key={idx} sx={{ p: 2, mb: 3 }}>
            <Typography><b>Original:</b> {stat.original}</Typography>
            <Typography><b>Short:</b> <a href={stat.short} target="_blank" rel="noopener noreferrer">{stat.short}</a></Typography>
            <Typography><b>Created:</b> {stat.created}</Typography>
            <Typography><b>Expires:</b> {stat.expires}</Typography>
            <Typography><b>Total Clicks:</b> {stat.clicks.length}</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Click Details</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stat.clicks.map((click, i) => (
                      <TableRow key={i}>
                        <TableCell>{click.timestamp}</TableCell>
                        <TableCell>{click.source}</TableCell>
                        <TableCell>{click.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default StatsPage; 