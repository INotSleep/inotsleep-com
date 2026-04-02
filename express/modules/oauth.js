import axios from 'axios';
import express from 'express';
import crypto from 'node:crypto';
import { getUserByGitHubId, createUser, modifyUser } from './database.js';

const baseURL = process.env.BASE_URL || "https://inotsleep.com";

function sanitizeRedirectAfter(value) {
    if (typeof value !== "string") return "/";
    if (!value.startsWith("/")) return "/";
    if (value.startsWith("//")) return "/";
    return value;
}

function generateSecureToken(byteLength) {
    return crypto.randomBytes(byteLength).toString("base64url");
}

function generateCodeChallenge(codeVerifier) {
    return crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');
}

function timingSafeEqualString(left, right) {
    if (typeof left !== "string" || typeof right !== "string") {
        return false;
    }

    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

/**
 * @param {express.Express} app
 */
function init(app) {
    app.get("/api/oauth/start", async (req, res) => {
        if (!req.session) {
            return res.status(500).send("Session is unavailable");
        }

        const clientId = process.env.OAUTH_CLIENT_ID;
        const scopes = "read:user";
        const redirectAfter = sanitizeRedirectAfter(req.query.redirect_after || '/');
        const redirectUri = `${baseURL}/api/oauth/callback?redirect_after=${encodeURIComponent(redirectAfter)}`;
        
        const state = generateSecureToken(48);
        req.session.oauthState = state;

        const codeVerifier = generateSecureToken(64);
        const codeChallenge = generateCodeChallenge(codeVerifier);

        req.session.oauthCodeVerifier = codeVerifier;

        const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
        req.session.save((saveErr) => {
            if (saveErr) {
                console.error("OAuth start session save error:", saveErr);
                return res.status(500).send("Failed to initialize OAuth session");
            }
            res.redirect(oauthUrl);
        });
    });

    app.get("/api/oauth/callback", async (req, res) => {
        if (!req.session) {
            return res.status(500).send("Session is unavailable");
        }

        const code = req.query.code;
        const state = req.query.state;
        const redirectAfter = sanitizeRedirectAfter(req.query.redirect_after || '/');
        const expectedState = req.session.oauthState;
        const codeVerifier = req.session.oauthCodeVerifier;

        if (!timingSafeEqualString(String(state || ""), String(expectedState || "")) || !codeVerifier) {
            delete req.session.oauthState;
            delete req.session.oauthCodeVerifier;
            return res.status(400).send('Invalid state parameter');
        }

        try {
            const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
                client_id: process.env.OAUTH_CLIENT_ID,
                client_secret: process.env.OAUTH_CLIENT_SECRET,
                code: code,
                code_verifier: codeVerifier
            }, {
                headers: {
                    'Accept': 'application/json'
                },
                validateStatus: () => true
            });

            delete req.session.oauthState;
            delete req.session.oauthCodeVerifier;
            
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

            req.session.regenerate((regenErr) => {
                if (regenErr) {
                    console.error("Session regenerate error:", regenErr);
                    return res.status(500).send("Failed to initialize user session");
                }

                req.session.userId = localUser.id;
                req.session.save((saveErr) => {
                    if (saveErr) {
                        console.error("Session save error after OAuth:", saveErr);
                        return res.status(500).send("Failed to persist user session");
                    }

                    res.redirect(redirectAfter);
                });
            });
        } catch (err) {
            console.error("OAuth callback failure:", err);
            res.status(500).send("OAuth callback failed");
        }
    });
}

export default {
    init,
    priority: 0
}
