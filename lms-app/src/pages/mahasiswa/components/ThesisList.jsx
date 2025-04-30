import React from 'react';
import { List, ListItem, ListItemText, ListItemButton, Divider } from '@mui/material';

const ThesisList = ({ theses, onThesisSelect, selectedThesisId }) => {
  return (
    <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
      {theses.map((thesis) => (
        <React.Fragment key={thesis.id}>
          <ListItem disablePadding>
            <ListItemButton
              selected={selectedThesisId === thesis.id}
              onClick={() => onThesisSelect(thesis)}
            >
              <ListItemText
                primary={thesis.title}
                secondary={`Penulis: ${thesis.author} | Tahun: ${thesis.year}`}
              />
            </ListItemButton>
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
};

export default ThesisList;