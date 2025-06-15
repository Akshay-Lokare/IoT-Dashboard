import React, { useEffect, useState } from 'react';

import Navbar from '../../components/navbar';
import AdminAllUsers from '../../components/admin/adminAllUsers';
import AdminAllDevices from '../../components/admin/adminAllDevices';

export default function AdminDashboard() {
    return(
        <div className='admin-dashboard'>
            <Navbar />

            <AdminAllUsers />
            <AdminAllDevices />

        </div>
    );
}
