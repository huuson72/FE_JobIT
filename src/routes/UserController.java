package vn.hstore.jobhunter.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;
import vn.hstore.jobhunter.domain.User;
import vn.hstore.jobhunter.domain.request.ChangePasswordRequest;
import vn.hstore.jobhunter.domain.request.UpdateUserInfoRequest;
import vn.hstore.jobhunter.domain.response.ResCreateUserDTO;
import vn.hstore.jobhunter.domain.response.ResUpdateUserDTO;
import vn.hstore.jobhunter.domain.response.ResUserDTO;
import vn.hstore.jobhunter.domain.response.ResultPaginationDTO;
import vn.hstore.jobhunter.service.UserService;
import vn.hstore.jobhunter.util.annotation.ApiMessage;
import vn.hstore.jobhunter.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserService userService;

    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/users")
    @ApiMessage("Create a new user")
    public ResponseEntity<ResCreateUserDTO> createNewUser(@Valid @RequestBody User postManUser)
            throws IdInvalidException {
        boolean isEmailExist = this.userService.isEmailExist(postManUser.getEmail());
        if (isEmailExist) {
            throw new IdInvalidException(
                    "Email " + postManUser.getEmail() + "đã tồn tại, vui lòng sử dụng email khác.");
        }

        String hashPassword = this.passwordEncoder.encode(postManUser.getPassword());
        postManUser.setPassword(hashPassword);
        User ericUser = this.userService.handleCreateUser(postManUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(this.userService.convertToResCreateUserDTO(ericUser));
    }

    @DeleteMapping("/users/{id}")
    @ApiMessage("Delete a user")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") long id)
            throws IdInvalidException {
        User currentUser = this.userService.fetchUserById(id);
        if (currentUser == null) {
            throw new IdInvalidException("User với id = " + id + " không tồn tại");
        }

        this.userService.handleDeleteUser(id);
        return ResponseEntity.ok(null);
    }

    @GetMapping("/users/{id}")
    @ApiMessage("fetch user by id")
    public ResponseEntity<ResUserDTO> getUserById(@PathVariable("id") long id) throws IdInvalidException {
        User fetchUser = this.userService.fetchUserById(id);
        if (fetchUser == null) {
            throw new IdInvalidException("User với id = " + id + " không tồn tại");
        }

        return ResponseEntity.status(HttpStatus.OK)
                .body(this.userService.convertToResUserDTO(fetchUser));
    }

    // fetch all users
    @GetMapping("/users")
    @ApiMessage("fetch all users")
    public ResponseEntity<ResultPaginationDTO> getAllUser(
            @Filter Specification<User> spec,
            Pageable pageable) {

        return ResponseEntity.status(HttpStatus.OK).body(
                this.userService.fetchAllUser(spec, pageable));
    }

    @PutMapping("/users")
    @ApiMessage("Update a user")
    public ResponseEntity<ResUpdateUserDTO> updateUser(@RequestBody User user) throws IdInvalidException {
        User ericUser = this.userService.handleUpdateUser(user);
        if (ericUser == null) {
            throw new IdInvalidException("User với id = " + user.getId() + " không tồn tại");
        }
        return ResponseEntity.ok(this.userService.convertToResUpdateUserDTO(ericUser));
    }

    @PutMapping("/users/profile")
    @ApiMessage("Cập nhật thông tin người dùng")
    public ResponseEntity<ResUserDTO> updateUserInfo(
            @Valid @RequestBody UpdateUserInfoRequest request) throws IdInvalidException {
        
        // Get current authenticated user
        User currentUser = this.userService.getCurrentUser();
        if (currentUser == null) {
            throw new IdInvalidException("Không tìm thấy thông tin người dùng đang đăng nhập");
        }

        // Check if new email already exists for another user
        if (request.getEmail() != null && !request.getEmail().equals(currentUser.getEmail())) {
            boolean isEmailExist = this.userService.isEmailExist(request.getEmail());
            if (isEmailExist) {
                throw new IdInvalidException(
                        "Email " + request.getEmail() + " đã tồn tại, vui lòng sử dụng email khác.");
            }
        }

        // Update user information
        currentUser.setName(request.getFullName());
        if (request.getEmail() != null) {
            currentUser.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            currentUser.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            currentUser.setAddress(request.getAddress());
        }

        User updatedUser = this.userService.handleUpdateUser(currentUser);
        return ResponseEntity.ok(this.userService.convertToResUserDTO(updatedUser));
    }

    @PutMapping("/users/change-password")
    @ApiMessage("Thay đổi mật khẩu người dùng")
    public ResponseEntity<ResUserDTO> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) throws IdInvalidException {
        
        // Get current authenticated user
        User currentUser = this.userService.getCurrentUser();
        if (currentUser == null) {
            throw new IdInvalidException("Không tìm thấy thông tin người dùng đang đăng nhập");
        }

        // Verify current password
        if (!this.passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new IdInvalidException("Mật khẩu hiện tại không chính xác");
        }

        // Validate that new password and confirm password match
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new IdInvalidException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }

        // Update password
        String hashPassword = this.passwordEncoder.encode(request.getNewPassword());
        currentUser.setPassword(hashPassword);

        User updatedUser = this.userService.handleUpdateUser(currentUser);
        return ResponseEntity.ok(this.userService.convertToResUserDTO(updatedUser));
    }

}
