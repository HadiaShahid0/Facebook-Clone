// import { useEffect, useState } from "react";
// import { Search, User } from "react-feather";
// import { getAllUsersService } from "../services/adminServices";

// const AdminUsers = () => {
//   const [users, setUsers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadUsers();
//   }, []);

//   const loadUsers = async () => {
//     try {
//       const data = await getAllUsersService();
//       setUsers(data);
//     } catch (error) {
//       console.error("Error loading users:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredUsers = users.filter((user) =>
//     user.username?.toLowerCase().includes(search.toLowerCase()),
//   );

//   return (
//     <div className="p-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <div>
//           <h4 className="fw-bold mb-1">Users</h4>
//           <p className="text-muted mb-0">Manage all users on the platform.</p>
//         </div>

//         <span className="badge bg-primary fs-6">{users.length} Users</span>
//       </div>

//       {/* Search */}
//       <div className="input-group mb-4" style={{ maxWidth: "400px" }}>
//         <span className="input-group-text bg-white">
//           <Search size={18} />
//         </span>

//         <input
//           type="text"
//           className="form-control"
//           placeholder="Search users..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       <div className="bg-white rounded-4 shadow-sm">
//         {loading ? (
//           <div className="text-center py-5">
//             <div className="spinner-border text-primary" />
//           </div>
//         ) : filteredUsers.length === 0 ? (
//           <div className="text-center text-muted py-5">No users found.</div>
//         ) : (
//           <div className="table-responsive">
//             <table className="table align-middle mb-0">
//               <thead>
//                 <tr className="text-muted">
//                   <th>User</th>
//                   <th>Email</th>
//                   <th>Account Status</th>
//                   <th>Role</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {filteredUsers.map((user) => (
//                   <tr key={user.id}>
//                     <td>
//                       <div className="d-flex align-items-center gap-2">
//                         {user.profileImage ? (
//                           <img
//                             src={user.profileImage}
//                             alt=""
//                             className="rounded-circle"
//                             width="40"
//                             height="40"
//                           />
//                         ) : (
//                           <div
//                             className="rounded-circle bg-light d-flex align-items-center justify-content-center"
//                             style={{
//                               width: "40px",
//                               height: "40px",
//                             }}
//                           >
//                             <User size={18} />
//                           </div>
//                         )}

//                         <span className="fw-semibold">{user.username}</span>
//                       </div>
//                     </td>

//                     <td>{user.email}</td>

//                     <td>
//                       {user.isSuspended ? (
//                         <span className="badge bg-danger">Suspended</span>
//                       ) : (
//                         <span className="badge bg-success">Active</span>
//                       )}
//                     </td>

//                     <td>
//                       {user.isAdmin ? (
//                         <span className="badge bg-primary">Admin</span>
//                       ) : (
//                         <span className="badge bg-light text-dark">User</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminUsers;
