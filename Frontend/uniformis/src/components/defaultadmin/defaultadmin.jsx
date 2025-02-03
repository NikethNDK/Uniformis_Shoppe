import React, { useEffect } from 'react';

const AdminRedirect = () => {
  useEffect(() => {
    window.location.href = 'http://localhost:8000/defaultadmin/';
  }, []);

  return <div>Redirecting to admin...</div>;
};

export default AdminRedirect;