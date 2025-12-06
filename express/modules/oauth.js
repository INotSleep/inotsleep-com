import axios from 'axios';
import express from 'express';
import crypto from 'crypto';
import { getUserByGitHubId, createUser, modifyUser } from './database.js';

const baseURL = process.env.BASE_URL || "https://inotsleep.com";

function sanitizeRedirectAfter(value) {
    if (typeof value !== "string") return "/";
    if (!value.startsWith("/")) return "/";
    if (value.startsWith("//")) return "/";
    return value;
}

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function generate43CharSHA256(string) {
    const hash = crypto.createHash('sha256').update(string).digest('base64url');
    return hash.substring(0, 43);
}

/**
 * @param {express.Express} app
 */
function init(app) {
    app.get("/api/oauth/start", async (req, res) => {
        const clientId = process.env.OAUTH_CLIENT_ID;
        const scopes = "read:user";
        const redirectAfter = sanitizeRedirectAfter(req.query.redirect_after || '/');
        const redirectUri = `${baseURL}/api/oauth/callback?redirect_after=${encodeURIComponent(redirectAfter)}`;
        
        const state = generateRandomString(64);
        req.session.oauthState = state;

        const codeVeriferKey = generateRandomString(128)
        const codeVerifier = generate43CharSHA256(codeVeriferKey);

        req.session.oauthCodeVerifierKey = codeVeriferKey;

        const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}&code_challenge=${codeVerifier}&code_challenge_method=S256`;
        req.session.save(() => {
            res.redirect(oauthUrl);
        });
    });

    app.get("/api/oauth/callback", async (req, res) => {
        const code = req.query.code;
        const state = req.query.state;
        const redirectAfter = sanitizeRedirectAfter(req.query.redirect_after || '/');

        if (state !== req.session.oauthState) {
            delete req.session.oauthState;
            delete req.session.oauthCodeVerifierKey;
            return res.status(400).send('Invalid state parameter');
        }

        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.OAUTH_CLIENT_ID,
            client_secret: process.env.OAUTH_CLIENT_SECRET,
            code: code,
            code_verifier: req.session.oauthCodeVerifierKey
        }, {
            headers: {
                'Accept': 'application/json'
            },
            validateStatus: () => true
        });

        delete req.session.oauthState;
        delete req.session.oauthCodeVerifierKey;
        
        if (tokenResponse.status !== 200 || !tokenResponse.data.access_token) {
            console.error("OAuth token error:", tokenResponse.status, tokenResponse.data);
            return res.status(500).send("OAuth token exchange failed");
        }

        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${tokenResponse.data.access_token}`
            },
            validateStatus: () => true
        });

        if (userResponse.status !== 200) {
            console.error("GitHub user error:", userResponse.status, userResponse.data);
            return res.status(500).send("Failed to fetch user profile");
        }

        let localUser = getUserByGitHubId(userResponse.data.id);
        if (!localUser) {
            localUser = createUser(
                userResponse.data.id,
                userResponse.data.login,
                userResponse.data.avatar_url,
                tokenResponse.data.access_token
            );
        } else {
            localUser = modifyUser(
                localUser.id,
                userResponse.data.login,
                userResponse.data.avatar_url,
                tokenResponse.data.access_token
            );
        }

        req.session.userId = localUser.id;

        res.redirect(redirectAfter);
    });
}

export default {
    init,
    priority: 0
}