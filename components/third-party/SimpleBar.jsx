import PropTypes from 'prop-types';

// material-ui
import Box from '@mui/material/Box';
import { useMediaQuery, useTheme } from '@mui/material';

// ==============================|| SIMPLE SCROLL BAR ||============================== //

export default function SimpleBarScroll({ children, sx, ...other }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Use native scrollbar with custom styling
  const scrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '4px',
      '&:hover': {
        background: 'rgba(0, 0, 0, 0.3)',
      },
    },
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: '100%',
        overflowX: isMobile ? 'auto' : 'hidden',
        overflowY: 'auto',
        ...scrollbarStyles,
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}

SimpleBarScroll.propTypes = { children: PropTypes.any, sx: PropTypes.any, other: PropTypes.any };
