'use strict';

const { sanitize } = require('@strapi/utils');
const crypto = require('crypto');

module.exports = {
  async register(ctx) {
    const { username, email, password, peran } = ctx.request.body;

    // Validate peran
    const validPeran = ['Dosen', 'Mahasiswa'];
    if (!validPeran.includes(peran)) {
      return ctx.badRequest('Peran tidak valid');
    }

    // Call the default register method
    const user = await strapi.plugins['users-permissions'].services.user.add({
      username,
      email,
      password,
      peran, // Add peran here
      provider: 'local',
      confirmed: false,
    });

    const sanitizedUser = await sanitize.contentAPI.output(user, strapi.getModel('plugin::users-permissions.user'));

    // Generate JWT
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
      id: user.id,
    });

    ctx.body = {
      jwt,
      user: sanitizedUser,
    };
  },

  async emailConfirmation(ctx) {
    const { confirmationToken, nama, role_id, nim, nip, nidn, program_studi, semester } = ctx.request.body;

    if (!confirmationToken) {
      return ctx.badRequest('Confirmation token is required');
    }

    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { confirmationToken } });

    if (!user) {
      return ctx.badRequest('Invalid confirmation token');
    }

    const role = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { name: role_id } });

    if (!role && role_id !== 'Mahasiswa' && role_id !== 'Dosen') {
      return ctx.badRequest('Invalid role');
    }

    await strapi
      .query('plugin::users-permissions.user')
      .update({
        where: { id: user.id },
        data: {
          confirmed: true,
          confirmationToken: null,
          nama,
          role_id,
          role: role ? role.id : null,
          nim: nim || null,
          nip: nip || null,
          nidn: nidn || null,
          program_studi: program_studi || null,
          semester: semester ? parseInt(semester) : null,
        },
      });

    const sanitizedUser = await sanitize.contentAPI.output(
      user,
      strapi.getModel('plugin::users-permissions.user'),
      { auth: ctx.state.auth }
    );

    ctx.body = {
      user: {
        id: sanitizedUser.id,
        email: sanitizedUser.email,
        username: sanitizedUser.username,
        role: role_id.toLowerCase(),
      },
    };
  },

  async login(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
      return ctx.badRequest('Email and password are required');
    }

    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { email }, populate: ['role'] });

    if (!user) {
      return ctx.badRequest('Invalid credentials');
    }

    if (!user.confirmed) {
      return ctx.badRequest('Please confirm your email before logging in');
    }

    const validPassword = await strapi
      .plugin('users-permissions')
      .service('user')
      .validatePassword(password, user.password);

    if (!validPassword) {
      return ctx.badRequest('Invalid credentials');
    }

    const token = strapi
      .plugin('users-permissions')
      .service('jwt')
      .issue({ id: user.id });

    const sanitizedUser = await sanitize.contentAPI.output(
      user,
      strapi.getModel('plugin::users-permissions.user'),
      { auth: ctx.state.auth }
    );

    let roleType;
    if (sanitizedUser.nim) {
      roleType = 'mahasiswa';
    } else if (sanitizedUser.nip || sanitizedUser.nidn) {
      roleType = 'dosen';
    } else if (sanitizedUser.role?.type) {
      roleType = sanitizedUser.role.type.toLowerCase();
    } else if (sanitizedUser.role_id) {
      roleType = sanitizedUser.role_id.toLowerCase();
    } else {
      roleType = 'unknown';
    }

    ctx.body = {
      jwt: token,
      user: {
        id: sanitizedUser.id,
        email: sanitizedUser.email,
        nama: sanitizedUser.nama,
        nim: sanitizedUser.nim,
        program_studi: sanitizedUser.program_studi,
        semester: sanitizedUser.semester,
        nip: sanitizedUser.nip,
        nidn: sanitizedUser.nidn,
        role: roleType,
      },
    };
  },
};