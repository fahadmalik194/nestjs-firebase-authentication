import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from '../../dtos/register.dto';
import { LoginDto } from '../../dtos/login.dto';
import { AuthService } from '../../services/auth/auth.service';
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      // Create the new user account
      const user = await admin.auth().createUser({
        email: body.email,
        password: body.password,
        emailVerified: false,
        disabled: false,
      });

      // Return the created user
      return user;
    } catch (error) {
      // Handle any errors that occurred during the registration process
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    try {
      // Get the user by email
      const userRecord = await admin.auth().getUserByEmail(body.email);

      // Get the user's data
      const user = await admin.auth().getUser(userRecord.uid);

      // Temporary Code (List all users):
      const userArray = await admin.auth().listUsers();
      console.log('userArray', userArray);

      // Testing Consoles:
      // console.log('User Record', userRecord);
      // console.log('User', user);

      // Compare the passwords
      const isValid = await bcrypt.compare(body.password, user.passwordHash);

      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      // Get the user's ID token
      const idToken = await admin.auth().createCustomToken(user.uid);

      // Return the ID token
      return { token: idToken };
    } catch (error) {
      // The token is invalid, so we return an error
      return { authenticated: false, error: error.message };
    }
  }

  @Post('login/google')
  async loginWithGoogle(@Body('idToken') idToken: string): Promise<any> {
    try {
      // Verify the ID token and get the corresponding user.
      const user = await admin.auth().verifyIdToken(idToken);

      // Create a custom token for the user.
      const customToken = await admin.auth().createCustomToken(user.uid);

      return { token: customToken };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AuthGuard())
  @Post('dashboard')
  async me(@Req() req: any) {
    // Return the authenticated user
    return {
      loggedInUser: req.user,
      userAuthenticated: true,
    };
  }
}
