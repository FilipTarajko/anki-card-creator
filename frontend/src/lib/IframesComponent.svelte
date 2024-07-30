<script lang="ts">
    export let iframe_source_template;
    export let selected_preset;
    export let current_presets_hue_as_number;
    export let iframe_with_replacements;
</script>

<div class='w-full flex flex-col items-center'>
    <div class="card p-2 w-11/12">
        {#each selected_preset?.iframes ?? [] as iframe, index}
            <button
                style={`color: hsl(${current_presets_hue_as_number + index*45} ${
                    iframe_source_template == iframe[1]
                        ? '100% 20%); background-color: hsl(' + (current_presets_hue_as_number + index*45) + ' 100% 87%);'
                        : '70% 50%);'
                }`}
                class={`btn ${
                    iframe_source_template == iframe[1] ? 'variant-filled' : 'variant-ghost'
                } m-0.5`}
                on:click={()=>{iframe_source_template = iframe[1]}}
            >
                {iframe[0]}
            </button>
        {/each}
    </div>
    <div style="word-wrap: break-word; line-break:anywhere; max-width: 96%;">{iframe_with_replacements}</div>
    <iframe title="iframe" src={iframe_with_replacements} style="width: 96%; height: 100vh;" />
</div>