import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.svg';
import { 
  FaHome, 
  FaBook, 
  FaClipboardList, 
  FaComments, 
  FaUser, 
  FaSignOutAlt,
  FaSearch
} from 'react-icons/fa';

const Sidebar = ({ role }) => {
  const { logout } = useContext(AuthContext);

  const studentLinks = [
    { path: '/student/dashboard', icon: <FaHome />, text: 'Dashboard' },
    { path: '/student/courses', icon: <FaBook />, text: 'My Courses' },
    { path: '/student/browse-courses', icon: <FaSearch />, text: 'Browse Courses' },
    { path: '/student/assignments', icon: <FaClipboardList />, text: 'Assignments' },
    { path: '/student/discussions', icon: <FaComments />, text: 'Discussions' },
    { path: '/student/profile', icon: <FaUser />, text: 'Profile' },
  ];

  const teacherLinks = [
    { path: '/teacher/dashboard', icon: <FaHome />, text: 'Dashboard' },
    { path: '/teacher/courses', icon: <FaBook />, text: 'My Courses' },
    { path: '/teacher/assignments', icon: <FaClipboardList />, text: 'Assignments' },
    { path: '/teacher/discussions', icon: <FaComments />, text: 'Discussions' },
    { path: '/teacher/profile', icon: <FaUser />, text: 'Profile' },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', icon: <FaHome />, text: 'Dashboard' },
    { path: '/admin/users', icon: <FaUser />, text: 'User Management' },
    { path: '/admin/courses', icon: <FaBook />, text: 'Course Management' },
    { path: '/admin/assignments', icon: <FaClipboardList />, text: 'Assignments' },
    { path: '/admin/settings', icon: <FaClipboardList />, text: 'System Settings' },
  ];

  const links = role === 'student' 
    ? studentLinks 
    : role === 'teacher' 
      ? teacherLinks 
      : adminLinks;

  return (
    <div className="sidebar h-100 d-flex flex-column">
      <div className="p-3 border-bottom border-light border-opacity-25">
        <div className="d-flex align-items-center">
          <img src={logo} alt="EDUVERSE Logo" height="40" className="me-2" />
          <div>
            <h5 className="mb-0 fw-bold text-white">EDUVERSE</h5>
            <small className="text-white-50">Learning Management System</small>
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <h6 className="text-uppercase text-white-50 small fw-bold">NAVIGATION</h6>
      </div>
      
      <nav className="flex-grow-1">
        <ul className="nav flex-column">
          {links.map((link, index) => (
            <li className="nav-item" key={index}>
              <NavLink 
                to={link.path} 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center py-3 px-3 ${isActive ? 'active' : ''}`
                }
              >
                <span className="me-3">{link.icon}</span>
                {link.text}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto p-3 border-top border-light border-opacity-25">
        <button 
          onClick={logout} 
          className="btn btn-outline-light d-flex align-items-center w-100"
        >
          <FaSignOutAlt className="me-2" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;