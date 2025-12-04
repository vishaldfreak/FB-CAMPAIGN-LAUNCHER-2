/**
 * Asset Feed Spec Builder
 * Phase 7: Build asset_feed_spec for Placement Asset Customization
 * CRITICAL: This is the most complex part of the implementation
 */

/**
 * Build asset_feed_spec from UI data
 * CRITICAL: All labels must match between assets and rules
 */
export function buildAssetFeedSpec(uiData) {
  const {
    adFormats, // ['SINGLE_IMAGE', 'SINGLE_VIDEO', 'CAROUSELS']
    images = [],
    videos = [],
    titles = [],
    bodies = [],
    descriptions = [],
    linkUrls = [],
    callToActionTypes = [],
    placements = [] // Array of placement configurations
  } = uiData;

  // Validate minimum 2 placement rules
  if (!placements || placements.length < 2) {
    throw new Error('Placement Asset Customization requires at least 2 placement rules');
  }

  // Build asset arrays with adlabels
  const assetFeedSpec = {
    ad_formats: adFormats || ['SINGLE_IMAGE'],
    optimization_type: 'PLACEMENT', // CRITICAL: Required
    asset_customization_rules: []
  };

  // Process images with labels
  if (images.length > 0) {
    assetFeedSpec.images = images.map(img => {
      const asset = {
        hash: img.hash || img.image_hash,
        adlabels: img.labels ? img.labels.map(label => ({ name: label })) : []
      };
      
      // Add image crops if provided
      if (img.image_crops) {
        asset.image_crops = img.image_crops;
      }
      
      return asset;
    });
  }

  // Process videos with labels
  if (videos.length > 0) {
    assetFeedSpec.videos = videos.map(vid => ({
      video_id: vid.video_id,
      adlabels: vid.labels ? vid.labels.map(label => ({ name: label })) : []
    }));
  }

  // Process titles with labels
  if (titles.length > 0) {
    assetFeedSpec.titles = titles.map(title => ({
      text: title.text || '',
      adlabels: title.labels ? title.labels.map(label => ({ name: label })) : []
    }));
  }

  // Process bodies with labels
  if (bodies.length > 0) {
    assetFeedSpec.bodies = bodies.map(body => ({
      text: body.text || '',
      adlabels: body.labels ? body.labels.map(label => ({ name: label })) : []
    }));
  }

  // Process descriptions with labels
  if (descriptions.length > 0) {
    assetFeedSpec.descriptions = descriptions.map(desc => ({
      text: desc.text || '',
      adlabels: desc.labels ? desc.labels.map(label => ({ name: label })) : []
    }));
  }

  // Process link URLs with labels
  if (linkUrls.length > 0) {
    assetFeedSpec.link_urls = linkUrls.map(link => ({
      website_url: link.website_url,
      display_url: link.display_url || link.website_url,
      deeplink_url: link.deeplink_url || null,
      adlabels: link.labels ? link.labels.map(label => ({ name: label })) : []
    }));
  }

  // Process call to action types
  if (callToActionTypes.length > 0) {
    assetFeedSpec.call_to_action_types = callToActionTypes;
  }

  // Build customization rules
  assetFeedSpec.asset_customization_rules = placements.map(placement => {
    const rule = {
      customization_spec: {
        publisher_platforms: placement.publisher_platforms || []
      }
    };

    // Add platform-specific positions
    if (placement.facebook_positions && placement.facebook_positions.length > 0) {
      rule.customization_spec.facebook_positions = placement.facebook_positions;
    }
    if (placement.instagram_positions && placement.instagram_positions.length > 0) {
      rule.customization_spec.instagram_positions = placement.instagram_positions;
    }
    if (placement.messenger_positions && placement.messenger_positions.length > 0) {
      rule.customization_spec.messenger_positions = placement.messenger_positions;
    }
    if (placement.audience_network_positions && placement.audience_network_positions.length > 0) {
      rule.customization_spec.audience_network_positions = placement.audience_network_positions;
    }
    if (placement.threads_positions && placement.threads_positions.length > 0) {
      rule.customization_spec.threads_positions = placement.threads_positions;
    }

    // Add asset label based on format
    if (placement.image_label) {
      rule.image_label = { name: placement.image_label };
    }
    if (placement.video_label) {
      rule.video_label = { name: placement.video_label };
    }
    if (placement.carousel_label) {
      rule.carousel_label = { name: placement.carousel_label };
    }

    return rule;
  });

  // Validate all labels in rules exist in assets
  validateLabelConsistency(assetFeedSpec);

  return assetFeedSpec;
}

/**
 * Validate that all labels referenced in rules exist in assets
 */
function validateLabelConsistency(assetFeedSpec) {
  const assetLabels = new Set();

  // Collect all labels from assets
  ['images', 'videos', 'titles', 'bodies', 'descriptions', 'link_urls'].forEach(assetType => {
    if (assetFeedSpec[assetType] && Array.isArray(assetFeedSpec[assetType])) {
      assetFeedSpec[assetType].forEach(asset => {
        if (asset.adlabels && Array.isArray(asset.adlabels)) {
          asset.adlabels.forEach(label => {
            if (label.name) assetLabels.add(label.name);
          });
        }
      });
    }
  });

  // Check all rule labels exist
  assetFeedSpec.asset_customization_rules.forEach((rule, index) => {
    const ruleLabels = [];
    if (rule.image_label?.name) ruleLabels.push(rule.image_label.name);
    if (rule.video_label?.name) ruleLabels.push(rule.video_label.name);
    if (rule.carousel_label?.name) ruleLabels.push(rule.carousel_label.name);

    ruleLabels.forEach(label => {
      if (!assetLabels.has(label)) {
        throw new Error(`Rule ${index + 1} references label "${label}" which does not exist in assets`);
      }
    });
  });
}

/**
 * Validate placement combinations
 */
export function validatePlacementFormat(placement, adFormat) {
  // Instagram explore_home only supports SINGLE_IMAGE
  if (placement.instagram_positions?.includes('explore_home') && adFormat !== 'SINGLE_IMAGE') {
    throw new Error('Instagram explore_home placement only supports SINGLE_IMAGE format');
  }

  // Threads requires instagram stream
  if (placement.threads_positions?.includes('threads_stream')) {
    if (!placement.publisher_platforms?.includes('instagram') || 
        !placement.instagram_positions?.includes('stream')) {
      throw new Error('Threads placement requires instagram platform with stream position');
    }
  }

  return true;
}

export default {
  buildAssetFeedSpec,
  validatePlacementFormat
};
