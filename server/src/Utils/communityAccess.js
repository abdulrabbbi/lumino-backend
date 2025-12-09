import CommunityMember from "../Models/CommunityMember.js";
import User from "../Models/User.js";

export async function canUserJoinCommunity(userId, communityId = null) {
    try {
        const user = await User.findById(userId).populate({
            path: 'subscription',
            model: 'UserSubscription',
            populate: {
                path: 'subscriptionId',
                model: 'Subscription'
            }
        });

        if (!user) {
            return { canJoin: false, reason: 'User not found' };
        }

        if (user.isTestFamily) {
            return { canJoin: true, reason: 'Test user can join all communities' };
        }

        if (user.subscriptionActive) {
            return { canJoin: true, reason: 'Subscribed user can join all communities' };
        }

        if (!user.subscriptionActive) {
            const joinedCommunitiesCount = await CommunityMember.countDocuments({
                user: userId,
                status: 'joined'
            });

            if (joinedCommunitiesCount >= 2) {
                return {
                    canJoin: false,
                    reason: 'Free users can only join 2 communities. Upgrade your plan to join more.'
                };
            }

            return {
                canJoin: true,
                reason: 'Free user can join community (2 community limit)'
            };
        }

        return { canJoin: false, reason: 'Unknown user type' };
    } catch (error) {
        console.error('Error checking community access:', error);
        return { canJoin: false, reason: 'Error checking access' };
    }
}

export async function checkCommunityAccess(userId, communityId) {
    try {
        const membership = await CommunityMember.findOne({
            user: userId,
            community: communityId,
            status: 'joined'
        });

        if (membership) {
            return {
                hasAccess: true,
                membership,
                reason: 'User is a community member'
            };
        }

       
        const canJoinResult = await canUserJoinCommunity(userId);

        return {
            hasAccess: canJoinResult.canJoin,
            membership: null,
            reason: canJoinResult.reason,
            canRequestJoin: true
        };
    } catch (error) {
        console.error('Error checking community access:', error);
        return { hasAccess: false, reason: 'Error checking access' };
    }
}

export async function getUserCommunityLimit(userId) {
    try {
        const user = await User.findById(userId);

        if (!user) {
            return { limit: 0, current: 0, canJoinMore: false };
        }

        if (user.isTestFamily) {
            return { limit: Infinity, current: 0, canJoinMore: true, type: 'test' };
        }

        if (user.subscriptionActive) {
            return { limit: Infinity, current: 0, canJoinMore: true, type: 'subscribed' };
        }

        const joinedCommunitiesCount = await CommunityMember.countDocuments({
            user: userId,
            status: 'joined'
        });

        return {
            limit: 2,
            current: joinedCommunitiesCount,
            canJoinMore: joinedCommunitiesCount < 2,
            type: 'free'
        };
    } catch (error) {
        console.error('Error getting community limit:', error);
        return { limit: 0, current: 0, canJoinMore: false };
    }
}